from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import datetime, date
from decimal import Decimal


class LocalCheck(BaseModel):
    name: str
    status: Literal["pass", "fail", "warning"]
    detail: str


class NetworkSignal(BaseModel):
    type: Literal["flagged", "seen", "clean"]
    description: str


class InvoiceAnalysisResult(BaseModel):
    invoiceId: str
    status: Literal["approved", "hold", "blocked"]
    confidence: int  # 0-100
    fraudScore: int  # 0-100
    localChecks: List[LocalCheck]
    networkSignals: List[NetworkSignal]
    explanation: str
    vendor: str
    amount: float
    currency: str = "USDC"


class ThreatRecord(BaseModel):
    id: str
    vendor: str
    fraudScore: int
    firstSeen: str  # ISO date string
    timesSeen: int
    reason: str
    amountBlocked: float
    templateHash: Optional[str] = None


class ThreatAnalytics(BaseModel):
    totalBlockedAmount: float
    totalBlockedInvoices: int
    totalThreatsDetected: int
    rewardsEarned: float
    threats: List[ThreatRecord]


class ThreatReportRequest(BaseModel):
    invoiceId: str
    vendor: str
    fraudScore: int
    reason: str
    amount: float


class ThreatReportResponse(BaseModel):
    success: bool
    threatId: str


class Transaction(BaseModel):
    id: str
    status: Literal["paid", "held", "blocked"]
    vendor: str
    amount: float
    currency: str = "USDC"
    date: str  # ISO date string
    reason: str
    invoiceId: str


class WalletBalance(BaseModel):
    balance: float
    currency: str = "USDC"
    autoPaidThisMonth: float
    blockedThisMonth: float
