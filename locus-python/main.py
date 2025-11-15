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

        # Define tool usage policy
        async def can_use_tool(
            tool_name: str,
            tool_input: dict,
            context: ToolPermissionContext
        ):
            """Auto-approve Locus tools, deny others."""
            if tool_name.startswith('mcp__locus__'):
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

        # 2. Run a query that uses MCP tools
        print('Running sample query...\n')
        print('─' * 50)

        # Use ClaudeSDKClient for interactive conversation with can_use_tool callback
        async with ClaudeSDKClient(options=options) as client:
            await client.query('Send $0.1 to 0x45a5aaa6693a5aaf7357acaef1e54f403f150fba')

            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    # Print assistant responses
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(f'Claude: {block.text}')
                        elif isinstance(block, ToolUseBlock):
                            print(f'Using tool: {block.name}')
                elif isinstance(message, ResultMessage):
                    print(f'\nTotal cost: ${message.total_cost_usd:.4f}')
                    if hasattr(message.usage, 'input_tokens'):
                        # usage is an object
                        print(f'Input tokens: {message.usage.input_tokens}')
                        print(f'Output tokens: {message.usage.output_tokens}')
                    elif isinstance(message.usage, dict):
                        # usage is a dictionary
                        print(f'Input tokens: {message.usage.get("input_tokens", "N/A")}')
                        print(f'Output tokens: {message.usage.get("output_tokens", "N/A")}')

        print('─' * 50)
        print('\n✓ Query completed successfully!')

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
