"""Wallet/Treasury router"""
from fastapi import APIRouter
from app.models import WalletBalance
from app.storage import get_wallet_balance, wallet_state
from app.locus_wallet import get_wallet_info_from_locus

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/balance", response_model=WalletBalance)
async def get_balance():
    """Get current wallet balance and statistics from Locus MCP

    Returns:
        WalletBalance with current balance from Locus, auto-paid and blocked amounts from local state
    """
    # Query real balance from Locus MCP
    locus_info = await get_wallet_info_from_locus()

    # Combine real balance from Locus with local transaction tracking
    return WalletBalance(
        balance=locus_info['balance'],
        currency=locus_info['currency'],
        autoPaidThisMonth=wallet_state['autoPaidThisMonth'],
        blockedThisMonth=wallet_state['blockedThisMonth']
    )
