"""In-memory storage for all application data"""
from typing import Dict, List
from datetime import datetime
from app.models import (
    InvoiceAnalysisResult,
    ThreatRecord,
    Transaction,
    WalletBalance
)

# In-memory databases
invoices_db: Dict[str, InvoiceAnalysisResult] = {}
threats_db: Dict[str, ThreatRecord] = {}
transactions_db: Dict[str, Transaction] = {}

# Wallet state - initialized from environment or defaults to 0
import os

def _get_initial_balance() -> float:
    """Get initial wallet balance from environment variable or default to 0"""
    try:
        return float(os.getenv("INITIAL_WALLET_BALANCE", "0.0"))
    except ValueError:
        return 0.0

wallet_state = {
    "balance": _get_initial_balance(),
    "currency": "USDC",
    "autoPaidThisMonth": 0.0,
    "blockedThisMonth": 0.0
}


def save_invoice(invoice: InvoiceAnalysisResult) -> None:
    """Save invoice analysis result"""
    invoices_db[invoice.invoiceId] = invoice


def get_invoice(invoice_id: str) -> InvoiceAnalysisResult | None:
    """Retrieve invoice by ID"""
    return invoices_db.get(invoice_id)


def save_threat(threat: ThreatRecord) -> None:
    """Save threat record"""
    threats_db[threat.id] = threat


def get_all_threats() -> List[ThreatRecord]:
    """Get all threat records"""
    return list(threats_db.values())


def update_threat_seen_count(vendor: str) -> None:
    """Update times seen for a vendor threat"""
    for threat in threats_db.values():
        if threat.vendor == vendor:
            threat.timesSeen += 1
            break


def save_transaction(transaction: Transaction) -> None:
    """Save transaction record"""
    transactions_db[transaction.id] = transaction


def get_all_transactions() -> List[Transaction]:
    """Get all transactions"""
    return list(transactions_db.values())


def get_wallet_balance() -> WalletBalance:
    """Get current wallet balance"""
    return WalletBalance(**wallet_state)


def update_wallet_balance(amount: float, operation: str) -> None:
    """Update wallet balance

    Args:
        amount: Amount to add/subtract
        operation: 'pay' (subtract and increase autoPaid),
                  'block' (increase blocked),
                  'add' (add to balance)
    """
    if operation == "pay":
        wallet_state["balance"] -= amount
        wallet_state["autoPaidThisMonth"] += amount
    elif operation == "block":
        wallet_state["blockedThisMonth"] += amount
    elif operation == "add":
        wallet_state["balance"] += amount
