"""Query Etherscan API for wallet balance"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

WALLET_ADDRESS = "0xff05e68dfa157f930854249feca100dff9c6be73"
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")

def get_wallet_balance(address: str) -> dict:
    """
    Get wallet balance from Etherscan API

    Args:
        address: Ethereum wallet address

    Returns:
        dict with balance information
    """
    try:
        # Etherscan V2 API endpoint for balance
        url = "https://api.etherscan.io/v2/api"
        params = {
            "chainid": "1",  # Ethereum mainnet
            "module": "account",
            "action": "balance",
            "address": address,
            "tag": "latest",
            "apikey": ETHERSCAN_API_KEY
        }

        print(f"📊 Querying Etherscan for wallet: {address}")
        print(f"   Using API key: {ETHERSCAN_API_KEY[:10]}...")

        response = requests.get(url, params=params)
        data = response.json()

        print(f"\nFull API Response:")
        print(f"{'='*60}")
        print(data)
        print(f"{'='*60}\n")

        if data.get("status") == "1":
            # Balance is in Wei (1 ETH = 10^18 Wei)
            balance_wei = int(data.get("result", 0))
            balance_eth = balance_wei / (10 ** 18)

            result = {
                "address": address,
                "balance_wei": balance_wei,
                "balance_eth": balance_eth,
                "success": True
            }

            print(f"✓ Wallet Balance:")
            print(f"   Address: {address}")
            print(f"   Balance: {balance_eth:.6f} ETH")
            print(f"   Balance (Wei): {balance_wei}")

            return result
        else:
            error_msg = data.get("message", "Unknown error")
            print(f"❌ API Error: {error_msg}")
            return {
                "address": address,
                "balance_wei": 0,
                "balance_eth": 0.0,
                "success": False,
                "error": error_msg
            }

    except Exception as e:
        print(f"❌ Failed to query Etherscan: {str(e)}")
        return {
            "address": address,
            "balance_wei": 0,
            "balance_eth": 0.0,
            "success": False,
            "error": str(e)
        }


def get_usdc_balance(address: str) -> dict:
    """
    Get USDC token balance for wallet

    USDC Contract Address on Ethereum Mainnet: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

    Args:
        address: Ethereum wallet address

    Returns:
        dict with USDC balance information
    """
    try:
        # USDC contract address on Ethereum
        usdc_contract = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

        url = "https://api.etherscan.io/v2/api"
        params = {
            "chainid": "1",  # Ethereum mainnet
            "module": "account",
            "action": "tokenbalance",
            "contractaddress": usdc_contract,
            "address": address,
            "tag": "latest",
            "apikey": ETHERSCAN_API_KEY
        }

        print(f"\n📊 Querying USDC balance for: {address}")

        response = requests.get(url, params=params)
        data = response.json()

        print(f"\nFull USDC API Response:")
        print(f"{'='*60}")
        print(data)
        print(f"{'='*60}\n")

        if data.get("status") == "1":
            # USDC has 6 decimals
            balance_raw = int(data.get("result", 0))
            balance_usdc = balance_raw / (10 ** 6)

            result = {
                "address": address,
                "balance_raw": balance_raw,
                "balance_usdc": balance_usdc,
                "success": True
            }

            print(f"✓ USDC Balance:")
            print(f"   Address: {address}")
            print(f"   Balance: {balance_usdc:.2f} USDC")
            print(f"   Balance (raw): {balance_raw}")

            return result
        else:
            error_msg = data.get("message", "Unknown error")
            print(f"❌ API Error: {error_msg}")
            return {
                "address": address,
                "balance_raw": 0,
                "balance_usdc": 0.0,
                "success": False,
                "error": error_msg
            }

    except Exception as e:
        print(f"❌ Failed to query USDC balance: {str(e)}")
        return {
            "address": address,
            "balance_raw": 0,
            "balance_usdc": 0.0,
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    print("🔍 Etherscan Wallet Query\n")

    # Get ETH balance
    eth_balance = get_wallet_balance(WALLET_ADDRESS)

    # Get USDC balance
    usdc_balance = get_usdc_balance(WALLET_ADDRESS)

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Wallet: {WALLET_ADDRESS}")
    if eth_balance["success"]:
        print(f"ETH: {eth_balance['balance_eth']:.6f} ETH")
    if usdc_balance["success"]:
        print(f"USDC: {usdc_balance['balance_usdc']:.2f} USDC")
    print("="*60)
