import os
import asyncio
from dotenv import load_dotenv
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext
)
from typing import Dict, Any

async def main():
    try:
        # Load environment variables
        load_dotenv()

        print('🎯 Starting Locus Claude SDK application...\n')

        # 1. Configure MCP connection to Locus
        print('Configuring Locus MCP connection...')
        mcp_servers = {
            'locus': {
                'type': 'http',
                'url': 'https://mcp.paywithlocus.com/mcp',
                'headers': {
                    'Authorization': f'Bearer {os.getenv("LOCUS_API_KEY")}'
                }
            }
        }

        # Hardcoded recipient address
        RECIPIENT_ADDRESS = '0x45a5aaa6693a5aaf7357acaef1e54f403f150fba'

        # Simple tool approval - just auto-approve all Locus tools
        async def can_use_tool(
            tool_name: str,
            tool_input: dict,
            context: ToolPermissionContext
        ):
            """Auto-approve all Locus tools. Approval logic is handled by other models."""
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
                'mcp__locus__*',      # Allow all Locus tools
                'mcp__list_resources',
                'mcp__read_resource'
            ],
            can_use_tool=can_use_tool,
            env={'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY')}
        )

        print('✓ MCP configured\n')

        # 2. Query MCP for wallet information and send payment
        print('Querying Locus MCP...\n')
        print('─' * 50)

        async with ClaudeSDKClient(options=options) as client:
            # Query for wallet information
            print('\n📊 Querying wallet information from Locus MCP...\n')

            await client.query(
                'tell me EXACTLY how much money is in 0xff05e68dfa157f930854249feca100dff9c6be73 inside my locushacks. i gave you my locus API key. this is a wallet inside mY locus. just find how much money is in it please. '
            )

            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(f'Claude: {block.text}')
                        elif isinstance(block, ToolUseBlock):
                            print(f'🔧 Using tool: {block.name}')
                            print(f'   Input: {block.input}')
                elif isinstance(message, ResultMessage):
                    print(f'\n💵 API cost: ${message.total_cost_usd:.4f}')
                    if hasattr(message.usage, 'input_tokens'):
                        print(f'Input tokens: {message.usage.input_tokens}')
                        print(f'Output tokens: {message.usage.output_tokens}')
                    elif isinstance(message.usage, dict):
                        print(f'Input tokens: {message.usage.get("input_tokens", "N/A")}')
                        print(f'Output tokens: {message.usage.get("output_tokens", "N/A")}')

        print('─' * 50)
        print('\n✓ Query completed!')

        print('\n🚀 Your Locus application is working!')
        print('\nNext steps:')
        print('  • Modify the prompt in main.py to use Locus tools')
        print('  • Try asking Claude to use specific Locus tools')
        print('  • Explore MCP resources and capabilities\n')

    except Exception as error:
        error_message = str(error)
        print(f'❌ Error: {error_message}')
        print('\nPlease check:')
        print('  • Your .env file contains valid credentials')
        print('  • Your network connection is active')
        print('  • Your Locus and Anthropic API keys are correct\n')
        exit(1)

if __name__ == '__main__':
    asyncio.run(main())
