"""Transactions router"""
from typing import List, Optional
from fastapi import APIRouter, Query
from app.models import Transaction
from app.storage import get_all_transactions

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=List[Transaction])
async def get_transactions(
    limit: Optional[int] = Query(None, description="Limit number of results"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    status: Optional[str] = Query(None, description="Filter by status (paid/held/blocked)")
):
    """Get transaction history

    Args:
        limit: Maximum number of transactions to return
        offset: Number of transactions to skip
        status: Filter by transaction status

    Returns:
        List of transactions
    """
    transactions = get_all_transactions()

    # Filter by status if provided
    if status:
        transactions = [t for t in transactions if t.status == status]

    # Sort by date (most recent first)
    transactions.sort(key=lambda x: x.date, reverse=True)

    # Apply pagination
    if offset:
        transactions = transactions[offset:]
    if limit:
        transactions = transactions[:limit]

    return transactions
