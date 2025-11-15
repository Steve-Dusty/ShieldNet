# locus-python

A Locus-powered application using Anthropic Claude Agent SDK with MCP integration (Python version).

## About

This is the Python port of the TypeScript Locus application, configured to use:
- **Claude Agent SDK** for AI interactions with tool support
- **Locus MCP server** integration with API key authentication
- **Full tool calling** capabilities

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
```

3. Run the application:

```bash
python main.py
```

## Project Structure

- `main.py` - Main application file with MCP and Claude Agent SDK setup
- `.env` - Environment variables (credentials are already configured)
- `.env.example` - Example environment variables for reference
- `requirements.txt` - Python dependencies

## How It Works

1. **MCP Connection**: Connects to Locus MCP server with API key authentication
2. **Tool Discovery**: Automatically discovers and loads tools from Locus
3. **Agent Query**: Uses Claude Agent SDK to process queries with tool access
4. **Tool Execution**: Claude can call Locus tools to complete tasks

## Features

✅ **Fully Integrated:**
- Locus MCP server connection
- All Locus tools available to Claude
- API key authentication (secure, no OAuth needed)
- Automatic tool discovery
- Async/await pattern for Python

## Customization

### Modify the Prompt

Edit the query prompt in `main.py`:

```python
async for message in agent.query(
    prompt='Your custom prompt here - can ask Claude to use Locus tools!'
):
    # handle messages
    pass
```

### Add More MCP Servers

You can connect to multiple MCP servers:

```python
mcp_servers = {
    'locus': {
        'type': 'http',
        'url': 'https://mcp.paywithlocus.com/mcp',
        'headers': {'Authorization': f'Bearer {os.getenv("LOCUS_API_KEY")}'}
    },
    'another-server': {
        'type': 'sse',
        'url': 'https://example.com/mcp',
        'headers': {'X-API-Key': os.getenv('OTHER_API_KEY')}
    }
}
```

### Restrict Tools

Limit which tools Claude can use with `allowed_tools`:

```python
agent = Agent(
    client=client,
    mcp_servers=mcp_servers,
    allowed_tools=[
        'mcp__locus__specific_tool',  # only allow specific tool
        'mcp__list_resources'
    ],
    can_use_tool=can_use_tool
)
```

### Handle Different Message Types

Process various message types from the agent:

```python
async for message in agent.query(prompt='Your prompt'):
    if message['type'] == 'system' and message.get('subtype') == 'init':
        print('MCP servers:', message.get('mcp_servers'))
    elif message['type'] == 'result' and message.get('subtype') == 'success':
        print('Final result:', message.get('result'))
    elif message['type'] == 'error_during_execution':
        print('Error:', message.get('error'))
```

## Environment Variables

Your `.env` file should contain:
- `LOCUS_API_KEY` - Your Locus API key for MCP server authentication
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude

**Important**: Never commit your `.env` file to version control!

## Learn More

- [Locus Documentation](https://docs.paywithlocus.com)
- [Claude SDK Documentation](https://docs.anthropic.com)
- [Claude API Reference](https://docs.anthropic.com/en/api)
- [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)

## Support

For issues or questions:
- Check the [Locus documentation](https://docs.paywithlocus.com)
- Contact Locus support

---

Built with Locus 🎯
