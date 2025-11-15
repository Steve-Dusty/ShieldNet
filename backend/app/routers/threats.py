"""Threat analytics and reporting router"""
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import (
    ThreatAnalytics,
    ThreatRecord,
    ThreatReportRequest,
    ThreatReportResponse
)
from app.storage import (
    save_threat,
    get_all_threats,
    get_all_transactions
)

router = APIRouter(prefix="/api/threats", tags=["threats"])


@router.get("/analytics", response_model=ThreatAnalytics)
async def get_threat_analytics():
    """Get threat analytics dashboard data

    Returns:
        ThreatAnalytics with aggregated threat intelligence
    """
    threats = get_all_threats()
    transactions = get_all_transactions()

    # Calculate aggregates
    blocked_transactions = [t for t in transactions if t.status == "blocked"]
    total_blocked_amount = sum(t.amount for t in blocked_transactions)
    total_blocked_invoices = len(blocked_transactions)

    # Calculate rewards (simple formula: $1 per threat reported that helped others)
    rewards_earned = len(threats) * 25.0  # $25 per unique threat

    return ThreatAnalytics(
        totalBlockedAmount=total_blocked_amount,
        totalBlockedInvoices=total_blocked_invoices,
        totalThreatsDetected=len(threats),
        rewardsEarned=rewards_earned,
        threats=threats
    )


@router.post("/report", response_model=ThreatReportResponse)
async def report_threat(threat_data: ThreatReportRequest):
    """Report a blocked invoice to the threat network

    Args:
        threat_data: Threat report data

    Returns:
        ThreatReportResponse with success status and threat ID
    """
    # Generate threat ID
    threat_id = f"THR-{int(datetime.now().timestamp() * 1000)}"

    # Create threat record
    threat = ThreatRecord(
        id=threat_id,
        vendor=threat_data.vendor,
        fraudScore=threat_data.fraudScore,
        firstSeen=datetime.now().strftime("%Y-%m-%d"),
        timesSeen=1,
        reason=threat_data.reason,
        amountBlocked=threat_data.amount,
        templateHash=None  # Could generate hash from invoice template
    )

    # Save to threat database
    save_threat(threat)

    return ThreatReportResponse(
        success=True,
        threatId=threat_id
    )


async def auto_report_threat(
    invoice_id: str,
    vendor: str,
    fraud_score: int,
    reason: str,
    amount: float
) -> None:
    """Auto-report a threat when an invoice is blocked

    This is called automatically by the invoice analysis endpoint
    """
    threat_data = ThreatReportRequest(
        invoiceId=invoice_id,
        vendor=vendor,
        fraudScore=fraud_score,
        reason=reason,
        amount=amount
    )
    await report_threat(threat_data)
