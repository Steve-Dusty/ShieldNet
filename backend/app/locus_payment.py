"""Locus payment integration for approved invoices"""
import os
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    TextBlock,
    ToolUseBlock,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext
)

# Hardcoded recipient wallet address
RECIPIENT_ADDRESS = '0x45a5aaa6693a5aaf7357acaef1e54f403f150fba'


async def send_payment_via_locus(amount: float, invoice_id: str, vendor: str) -> dict:
    """
    Send payment via Locus MCP after invoice approval.

    Args:
        amount: Amount in USDC to send
        invoice_id: Invoice ID for tracking
        vendor: Vendor name for reference

    Returns:
        dict with payment status and details
    """
    try:
        print(f"💸 Initiating Locus payment for invoice {invoice_id}")
        print(f"   Amount: ${amount} USDC")
        print(f"   Vendor: {vendor}")
        print(f"   Recipient: {RECIPIENT_ADDRESS}")

        # Configure MCP connection to Locus
        mcp_servers = {
            'locus': {
                'type': 'http',
                'url': 'https://mcp.paywithlocus.com/mcp',
                'headers': {
                    'Authorization': f'Bearer {os.getenv("LOCUS_API_KEY")}'
                }
            }
        }

        # Simple approval - auto-approve all Locus tools
        async def can_use_tool(
            tool_name: str,
            tool_input: dict,
            context: ToolPermissionContext
        ):
            """Auto-approve all Locus tools."""
            if tool_name.startswith('mcp__locus__'):
                print(f'✓ Allowing Locus tool: {tool_name}')
                return PermissionResultAllow(behavior='allow')
            return PermissionResultDeny(
                behavior='deny',
                message='Only Locus tools are allowed'
            )

        # Configure options
        options = ClaudeAgentOptions(
            mcp_servers=mcp_servers,
            allowed_tools=[
                'mcp__locus__*',
                'mcp__list_resources',
                'mcp__read_resource'
            ],
            can_use_tool=can_use_tool,
            env={'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY')}
        )

        payment_result = {
            'success': False,
            'transaction_id': None,
            'message': '',
            'amount': amount,
            'recipient': RECIPIENT_ADDRESS
        }

        # Send payment via Locus MCP
        async with ClaudeSDKClient(options=options) as client:
            await client.query(
                f'Send ${amount} USDC '
                f'to {RECIPIENT_ADDRESS} for invoice {invoice_id} (vendor: {vendor})'
            )

            response_text = ""
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            response_text += block.text
                            print(f'Claude: {block.text}')
                        elif isinstance(block, ToolUseBlock):
                            print(f'🔧 Tool used: {block.name}')
                            if 'send' in block.name.lower() or 'pay' in block.name.lower():
                                payment_result['transaction_id'] = block.id

            payment_result['success'] = True
            payment_result['message'] = f'Payment of ${amount} USDC sent successfully'

        print(f"✓ Payment completed for invoice {invoice_id}")
        return payment_result

    except Exception as e:
        print(f"❌ Payment failed: {str(e)}")
        return {
            'success': False,
            'transaction_id': None,
            'message': f'Payment failed: {str(e)}',
            'amount': amount,
            'recipient': RECIPIENT_ADDRESS
        }


def send_payment_sync(amount: float, invoice_id: str, vendor: str) -> dict:
    """
    Synchronous wrapper for send_payment_via_locus.

    Args:
        amount: Amount in USDC to send
        invoice_id: Invoice ID for tracking
        vendor: Vendor name for reference

    Returns:
        dict with payment status and details
    """
    return asyncio.run(send_payment_via_locus(amount, invoice_id, vendor))
