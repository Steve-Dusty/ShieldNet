"""Invoice analysis router"""
import os
import shutil
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path
from app.models import InvoiceAnalysisResult, Transaction
from app.analyzer import InvoiceAnalyzer
from app.storage import (
    save_invoice,
    get_invoice,
    save_transaction,
    update_wallet_balance,
    invoices_db
)
from typing import List
from app.routers.threats import report_threat
from app.locus_payment import send_payment_via_locus

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

# Upload directory - use absolute path to avoid issues
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
print(f"Upload directory: {UPLOAD_DIR.absolute()}")

# Lazy analyzer initialization
_analyzer = None

def get_analyzer() -> InvoiceAnalyzer:
    """Get or create the invoice analyzer instance"""
    global _analyzer
    if _analyzer is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        _analyzer = InvoiceAnalyzer(api_key=api_key)
    return _analyzer


@router.post("/analyze", response_model=InvoiceAnalysisResult)
async def analyze_invoice(file: UploadFile = File(...)):
    """Analyze an uploaded invoice for fraud detection

    Args:
        file: Invoice file (PDF, PNG, JPG)

    Returns:
        InvoiceAnalysisResult with comprehensive fraud analysis
    """
    # Validate file type - PDF and images
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: PDF, PNG, JPG, JPEG"
        )

    # Validate file size (10MB max)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit"
        )

    # Save the file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    # Analyze the invoice using Claude SDK
    try:
        print(f"Starting analysis for file: {file_path}")
        analyzer = get_analyzer()
        print("Analyzer initialized, calling analyze_invoice...")
        result = analyzer.analyze_invoice(str(file_path))
        print(f"Analysis complete: {result.status}")
    except Exception as e:
        # Clean up the file if analysis fails
        print(f"Analysis error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Invoice analysis failed: {str(e)}"
        )

    # Save the invoice analysis
    save_invoice(result)

    # Create transaction record
    transaction = Transaction(
        id=f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        status="paid" if result.status == "approved" else "held" if result.status == "hold" else "blocked",
        vendor=result.vendor,
        amount=result.amount,
        currency=result.currency,
        date=datetime.now().strftime("%Y-%m-%d"),
        reason=result.explanation,
        invoiceId=result.invoiceId
    )
    save_transaction(transaction)

    # Update wallet balance
    if result.status == "approved":
        update_wallet_balance(result.amount, "pay")

        # Send payment via Locus MCP
        if result.walletAddress:
            try:
                print(f"📤 Sending payment via Locus for approved invoice {result.invoiceId}")
                payment_result = await send_payment_via_locus(
                    amount=result.amount,
                    invoice_id=result.invoiceId,
                    vendor=result.vendor,
                    wallet_address=result.walletAddress
                )
                if payment_result['success']:
                    print(f"✓ Locus payment successful: {payment_result['message']}")
                else:
                    print(f"⚠️ Locus payment failed: {payment_result['message']}")
            except Exception as e:
                print(f"❌ Locus payment error: {str(e)}")
                # Don't fail the request if payment fails
        else:
            print(f"⚠️ No wallet address found in invoice {result.invoiceId}, skipping payment")

    elif result.status == "blocked":
        update_wallet_balance(result.amount, "block")

    # If blocked, automatically report to threat network
    if result.status == "blocked":
        try:
            from app.routers.threats import auto_report_threat
            await auto_report_threat(
                invoice_id=result.invoiceId,
                vendor=result.vendor,
                fraud_score=result.fraudScore,
                reason=result.explanation,
                amount=result.amount
            )
        except Exception as e:
            # Don't fail the request if threat reporting fails
            print(f"Failed to report threat: {e}")

    return result


@router.post("/analyze/stream")
async def analyze_invoice_stream(file: UploadFile = File(...)):
    """Analyze invoice with streaming progress updates

    Returns Server-Sent Events stream with real-time analysis progress
    """
    # Validate file type
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: PDF, PNG, JPG, JPEG"
        )

    # Save the file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    # Stream the analysis
    async def event_generator():
        try:
            print(f"Starting streaming analysis for: {file_path}")
            analyzer = get_analyzer()

            for update in analyzer.analyze_invoice_streaming(str(file_path)):
                print(f"Sending update: {update['type']}")
                # Send Server-Sent Event
                yield f"data: {json.dumps(update)}\n\n"

                # If complete, also save to database
                if update["type"] == "complete":
                    result_data = update["result"]

                    # Save invoice
                    from app.models import InvoiceAnalysisResult
                    result = InvoiceAnalysisResult(**result_data)
                    save_invoice(result)
                    print(f"✓ Saved invoice {result.invoiceId} to database")
                    print(f"✓ Total invoices in DB: {len(invoices_db)}")

                    # Create transaction
                    transaction = Transaction(
                        id=f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        status="paid" if result.status == "approved" else "held" if result.status == "hold" else "blocked",
                        vendor=result.vendor,
                        amount=result.amount,
                        currency=result.currency,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        reason=result.explanation,
                        invoiceId=result.invoiceId
                    )
                    save_transaction(transaction)

                    # Update wallet
                    if result.status == "approved":
                        update_wallet_balance(result.amount, "pay")

                        # Send payment via Locus MCP
                        if result.walletAddress:
                            try:
                                print(f"📤 Sending payment via Locus for approved invoice {result.invoiceId}")
                                payment_result = await send_payment_via_locus(
                                    amount=result.amount,
                                    invoice_id=result.invoiceId,
                                    vendor=result.vendor,
                                    wallet_address=result.walletAddress
                                )
                                if payment_result['success']:
                                    print(f"✓ Locus payment successful: {payment_result['message']}")
                                else:
                                    print(f"⚠️ Locus payment failed: {payment_result['message']}")
                            except Exception as e:
                                print(f"❌ Locus payment error: {str(e)}")
                                # Don't fail the request if payment fails
                        else:
                            print(f"⚠️ No wallet address found in invoice {result.invoiceId}, skipping payment")

                    elif result.status == "blocked":
                        update_wallet_balance(result.amount, "block")

        except Exception as e:
            print(f"Streaming error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            if file_path.exists():
                file_path.unlink()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering for nginx/proxies
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.get("/history", response_model=List[InvoiceAnalysisResult])
async def get_invoice_history():
    """Get all analyzed invoices

    Returns:
        List of all invoice analysis results
    """
    return list(invoices_db.values())
