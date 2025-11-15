"""Claude SDK Invoice Analyzer - Uses Claude's vision API to analyze invoices"""
import os
import base64
from pathlib import Path
from typing import List
from anthropic import Anthropic
from app.models import (
    InvoiceAnalysisResult,
    LocalCheck,
    NetworkSignal
)
from app.storage import get_all_threats, update_threat_seen_count


def encode_image(image_path: str) -> str:
    """Encode image to base64"""
    with open(image_path, "rb") as image_file:
        return base64.standard_b64encode(image_file.read()).decode("utf-8")


def get_file_media_type(file_path: str) -> str:
    """Get media type from file extension"""
    ext = Path(file_path).suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }
    return media_types.get(ext, "application/pdf")


class InvoiceAnalyzer:
    """Analyzes invoices using Claude SDK"""

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)

    def analyze_invoice_streaming(self, file_path: str):
        """Analyze invoice with streaming progress updates

        Yields progress updates as the analysis happens
        """
        # Read and encode the file
        image_data = encode_image(file_path)
        media_type = get_file_media_type(file_path)

        yield {"type": "progress", "message": "File uploaded successfully", "step": 1}

        # Construct the prompt
        prompt = """You are an AI fraud detection agent for ShieldNet, analyzing invoices for potential fraud.

Analyze this invoice thoroughly and extract the following information:

1. **Basic Information:**
   - Invoice ID
   - Vendor name
   - Total amount
   - Currency (usually USDC)

2. **Fraud Detection Analysis:**
   - Calculate a fraud score (0-100, where 100 is definitely fraud)
   - Determine if this should be: APPROVED, HOLD, or BLOCKED
   - Your confidence level (0-100)

3. **Local Security Checks** (create 3-5 checks):
   - PO Match: Does this match purchase orders? (pass/fail/warning)
   - Hours Verification: Are hours reasonable? (pass/fail/warning)
   - Vendor Trust: Is this a trusted vendor? (pass/fail/warning)
   - Amount Reasonableness: Is the amount reasonable? (pass/fail/warning)
   - Line Item Review: Do line items look legitimate? (pass/fail/warning)

4. **Fraud Indicators** to check for:
   - Inflated hours or quantities
   - Duplicate charges
   - Suspicious vendor names
   - Missing purchase order references
   - Unusual amounts
   - Template similarities to known fraud

5. **Decision Rules:**
   - APPROVED: fraud_score < 30, all critical checks pass
   - HOLD: fraud_score 30-70, or warning flags present
   - BLOCKED: fraud_score > 70, or failed critical checks

Return your analysis in this EXACT JSON format:
{
  "invoiceId": "extracted invoice number",
  "vendor": "vendor name",
  "amount": total_amount_as_number,
  "fraudScore": score_0_to_100,
  "confidence": confidence_0_to_100,
  "status": "approved|hold|blocked",
  "explanation": "brief explanation of the decision",
  "localChecks": [
    {"name": "check name", "status": "pass|fail|warning", "detail": "specific detail"},
    ...
  ]
}

Be thorough and realistic in your analysis. Look for actual fraud indicators."""

        yield {"type": "progress", "message": "Sending to Claude AI for analysis...", "step": 2}

        # Build content
        if media_type == "application/pdf":
            file_content = {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data,
                },
            }
        else:
            file_content = {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data,
                },
            }

        yield {"type": "progress", "message": "AI is analyzing the invoice...", "step": 3}

        # Stream Claude API response
        full_response = ""
        with self.client.messages.stream(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        file_content,
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ],
                }
            ],
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield {"type": "stream", "text": text}

        yield {"type": "progress", "message": "Parsing analysis results...", "step": 4}

        # Parse the JSON response
        import json
        response_text = full_response
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()

        analysis_data = json.loads(response_text)

        yield {"type": "progress", "message": "Checking ShieldNet threat database...", "step": 5}

        # Generate network signals
        network_signals = self._generate_network_signals(
            analysis_data["vendor"],
            analysis_data["fraudScore"]
        )

        # Convert local checks
        local_checks = [
            LocalCheck(**check) for check in analysis_data["localChecks"]
        ]

        # Create the result
        result = InvoiceAnalysisResult(
            invoiceId=analysis_data["invoiceId"],
            status=analysis_data["status"],
            confidence=analysis_data["confidence"],
            fraudScore=analysis_data["fraudScore"],
            vendor=analysis_data["vendor"],
            amount=float(analysis_data["amount"]),
            currency="USDC",
            explanation=analysis_data["explanation"],
            localChecks=local_checks,
            networkSignals=network_signals
        )

        yield {"type": "complete", "result": result.model_dump()}

    def analyze_invoice(self, file_path: str) -> InvoiceAnalysisResult:
        """Analyze an invoice using Claude's vision API

        Args:
            file_path: Path to the uploaded invoice file

        Returns:
            InvoiceAnalysisResult with comprehensive fraud analysis
        """
        # Read and encode the file
        image_data = encode_image(file_path)
        media_type = get_file_media_type(file_path)

        # Construct the prompt for invoice analysis
        prompt = """You are an AI fraud detection agent for ShieldNet, analyzing invoices for potential fraud.

Analyze this invoice thoroughly and extract the following information:

1. **Basic Information:**
   - Invoice ID
   - Vendor name
   - Total amount
   - Currency (usually USDC)

2. **Fraud Detection Analysis:**
   - Calculate a fraud score (0-100, where 100 is definitely fraud)
   - Determine if this should be: APPROVED, HOLD, or BLOCKED
   - Your confidence level (0-100)

3. **Local Security Checks** (create 3-5 checks):
   - PO Match: Does this match purchase orders? (pass/fail/warning)
   - Hours Verification: Are hours reasonable? (pass/fail/warning)
   - Vendor Trust: Is this a trusted vendor? (pass/fail/warning)
   - Amount Reasonableness: Is the amount reasonable? (pass/fail/warning)
   - Line Item Review: Do line items look legitimate? (pass/fail/warning)

4. **Fraud Indicators** to check for:
   - Inflated hours or quantities
   - Duplicate charges
   - Suspicious vendor names
   - Missing purchase order references
   - Unusual amounts
   - Template similarities to known fraud

5. **Decision Rules:**
   - APPROVED: fraud_score < 30, all critical checks pass
   - HOLD: fraud_score 30-70, or warning flags present
   - BLOCKED: fraud_score > 70, or failed critical checks

Return your analysis in this EXACT JSON format:
{
  "invoiceId": "extracted invoice number",
  "vendor": "vendor name",
  "amount": total_amount_as_number,
  "fraudScore": score_0_to_100,
  "confidence": confidence_0_to_100,
  "status": "approved|hold|blocked",
  "explanation": "brief explanation of the decision",
  "localChecks": [
    {"name": "check name", "status": "pass|fail|warning", "detail": "specific detail"},
    ...
  ]
}

Be thorough and realistic in your analysis. Look for actual fraud indicators."""

        # Build content - use document for PDF, image for images
        if media_type == "application/pdf":
            file_content = {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data,
                },
            }
        else:
            file_content = {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data,
                },
            }

        # Call Claude API with newest model
        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        file_content,
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ],
                }
            ],
        )

        # Extract the response
        response_text = message.content[0].text

        # Parse the JSON response
        import json
        # Find JSON in the response (Claude sometimes wraps it in markdown)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()

        analysis_data = json.loads(response_text)

        # Generate network signals based on threat database
        network_signals = self._generate_network_signals(
            analysis_data["vendor"],
            analysis_data["fraudScore"]
        )

        # Convert local checks to LocalCheck objects
        local_checks = [
            LocalCheck(**check) for check in analysis_data["localChecks"]
        ]

        # Create the result
        result = InvoiceAnalysisResult(
            invoiceId=analysis_data["invoiceId"],
            status=analysis_data["status"],
            confidence=analysis_data["confidence"],
            fraudScore=analysis_data["fraudScore"],
            vendor=analysis_data["vendor"],
            amount=float(analysis_data["amount"]),
            currency="USDC",
            explanation=analysis_data["explanation"],
            localChecks=local_checks,
            networkSignals=network_signals
        )

        return result

    def _generate_network_signals(
        self, vendor: str, fraud_score: int
    ) -> List[NetworkSignal]:
        """Generate network signals based on threat database

        Args:
            vendor: Vendor name from invoice
            fraud_score: Calculated fraud score

        Returns:
            List of network signals
        """
        signals = []
        threats = get_all_threats()

        # Check if vendor is in threat database
        vendor_threats = [t for t in threats if t.vendor.lower() == vendor.lower()]

        if vendor_threats:
            threat = vendor_threats[0]
            signals.append(
                NetworkSignal(
                    type="flagged",
                    description=f"Vendor flagged by {threat.timesSeen} other companies"
                )
            )
            signals.append(
                NetworkSignal(
                    type="flagged",
                    description=f"Previously blocked ${threat.amountBlocked:,.0f} in fraudulent invoices"
                )
            )
            # Update the seen count
            update_threat_seen_count(vendor)
        else:
            # Vendor is clean in network
            if fraud_score < 30:
                signals.append(
                    NetworkSignal(
                        type="clean",
                        description="No similar scams seen in ShieldNet network"
                    )
                )

        return signals
