"""Query USDC balance on Base network"""
import os
import httpx


# Wallet address
WALLET_ADDRESS = "0xff05e68dfa157f930854249feca100dff9c6be73"

# USDC on Base
USDC_CONTRACT_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"


async def get_wallet_info_from_locus() -> dict:
    """
    Get USDC balance on Base network.

    Returns:
        dict with balance
    """
    try:
        api_key = os.getenv("ETHERSCAN_API_KEY")
        if not api_key:
            return {
                'balance': 0.0,
                'currency': 'USDC',
                'success': False,
                'message': 'API key not found'
            }

        print(f"📊 Getting USDC balance on Base for: {WALLET_ADDRESS}")

        async with httpx.AsyncClient() as client:
            # Use Etherscan V2 multichain API with Base chain ID
            response = await client.get(
                "https://api.etherscan.io/v2/api",
                params={
                    "chainid": "8453",  # Base network
                    "module": "account",
                    "action": "tokenbalance",
                    "contractaddress": USDC_CONTRACT_BASE,
                    "address": WALLET_ADDRESS,
                    "tag": "latest",
                    "apikey": api_key
                }
            )

            print(f"Status Code: {response.status_code}")
            data = response.json()
            print(f"BaseScan Response: {data}")

            if data.get("status") == "1":
                # USDC has 6 decimals
                balance_raw = int(data.get("result", 0))
                balance_usdc = balance_raw / (10 ** 6)

                print(f"✓ USDC Balance: {balance_usdc:.2f} USDC")

                return {
                    'balance': balance_usdc,
                    'currency': 'USDC',
                    'success': True,
                    'message': 'Balance retrieved from Base'
                }
            else:
                return {
                    'balance': 0.0,
                    'currency': 'USDC',
                    'success': False,
                    'message': data.get("message", "API error")
                }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            'balance': 0.0,
            'currency': 'USDC',
            'success': False,
            'message': str(e)
        }
