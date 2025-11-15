"""Wallet/Treasury router"""
from fastapi import APIRouter
from app.models import WalletBalance
from app.storage import get_wallet_balance

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/balance", response_model=WalletBalance)
async def get_balance():
    """Get current wallet balance and statistics

    Returns:
        WalletBalance with current balance, auto-paid and blocked amounts
    """
    return get_wallet_balance()
