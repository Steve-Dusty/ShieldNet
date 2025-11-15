# Locus Python Integration Guide

## Overview

This integration implements a sophisticated payment approval system using the Locus MCP server. It provides:

1. **Wallet Context Management** - Tracks balance, sent amounts, and blocked transactions
2. **Conditional Approval Logic** - Risk-based thresholds for automatic approval/denial
3. **Treasurer Reporting** - Comprehensive reporting of wallet activity

## How It Works

### Architecture

```
┌─────────────────┐
│  Claude Agent   │
│   (main.py)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│ can_use_tool()  │◄────►│  Wallet Context  │
│  Approval Logic │      │   - Balance      │
└────────┬────────┘      │   - Sent Amount  │
         │               │   - Blocked      │
         ▼               └──────────────────┘
┌─────────────────┐
│  Locus MCP      │
│    Server       │
└─────────────────┘
```

### Workflow

1. **Fetch Wallet Balance**
   - Query Locus MCP for current USDC balance
   - Update `wallet_context['balance']` with real-time data

2. **Payment Request**
   - Agent requests payment to hardcoded address: `0x45a5aaa6693a5aaf7357acaef1e54f403f150fba`
   - `can_use_tool()` interceptor analyzes the request

3. **Conditional Approval**
   - Extract amount from tool input
   - Check against balance and thresholds
   - Apply risk-based logic:
     - ≤ $1: Auto-approve
     - $1-$10: Check monthly budget ($20)
     - > $10: Auto-deny

4. **Execute or Block**
   - Approved: Update tracking, allow transaction
   - Denied: Log to blocked amount, prevent transaction

5. **Treasurer Report**
   - Display final wallet state
   - Show amounts sent and blocked

## Approval Logic

### Thresholds

```python
auto_approve_threshold = 1.0    # Auto-approve ≤ $1
manual_approve_threshold = 10.0 # Block > $10
monthly_budget = 20.0           # Monthly spending limit
```

### Decision Tree

```
Payment Request
    │
    ├─ Amount = 0? ──► DENY (invalid)
    │
    ├─ Amount > Balance? ──► DENY (insufficient funds)
    │
    ├─ Amount ≤ $1? ──► APPROVE (small amount)
    │
    ├─ Amount > $10? ──► DENY (exceeds threshold)
    │
    └─ $1 < Amount ≤ $10?
           │
           └─ Total + Amount ≤ $20? ──► APPROVE (within budget)
                                     └─► DENY (exceeds budget)
```

## Configuration

### Hardcoded Recipient

The recipient wallet address is hardcoded in `wallet_context`:

```python
wallet_context = {
    'recipient_address': '0x45a5aaa6693a5aaf7357acaef1e54f403f150fba'
}
```

### Adjustable Parameters

You can modify these in `main.py`:

- `auto_approve_threshold`: Small amount auto-approval
- `manual_approve_threshold`: Maximum allowed amount
- `monthly_budget`: Total monthly spending limit
- `payment_amount`: Test payment amount (line 193)

## Integration with Wallet Context

### Getting Balance from Locus

The integration fetches real-time balance:

```python
await client.query('What is my current USDC balance?')
# Response is parsed and stored in wallet_context['balance']
```

### Tracking Amounts

- `total_sent_this_month`: Cumulative approved payments
- `blocked_this_month`: Cumulative denied payments
- Updated in real-time by `can_use_tool()`

## Treasurer Report

The final report shows:

```
📈 TREASURER REPORT
═══════════════════════════════════════════════════
Recipient Address: 0x45a5aaa6693a5aaf7357acaef1e54f403f150fba
Current Balance: $X.XX USDC
Total Sent This Month: $Y.YY
Total Blocked This Month: $Z.ZZ
═══════════════════════════════════════════════════
```

## Running the Integration

1. **Setup Environment**
   ```bash
   # Create .env file with your credentials
   cp .env.example .env
   # Add your LOCUS_API_KEY and ANTHROPIC_API_KEY
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   ```bash
   python main.py
   ```

## Example Output

```
🎯 Starting Locus Claude SDK application...

Configuring Locus MCP connection...
✓ MCP configured

Running Locus payment workflow...
──────────────────────────────────────────────────

📊 Step 1: Fetching wallet balance and info...

✓ Allowing wallet query: mcp__locus__get_balance
🔧 Using tool: mcp__locus__get_balance
Claude: Your current balance is 10.5 USDC

✓ Updated wallet context: Balance = $10.5 USDC

💸 Step 2: Attempting payment...

💰 Payment Request Analysis:
   Tool: mcp__locus__send
   Amount: $0.1
   Recipient: 0x45a5aaa6693a5aaf7357acaef1e54f403f150fba
   Current Balance: $10.5 USDC
   Sent This Month: $0.0
   Blocked This Month: $0.0
✓ APPROVED: Small amount auto-approved (≤ $1.0)

🔧 Using tool: mcp__locus__send
   Input: {'amount': 0.1, 'address': '0x45a5aaa6693a5aaf7357acaef1e54f403f150fba'}
Claude: Payment sent successfully!

──────────────────────────────────────────────────

📈 TREASURER REPORT
═══════════════════════════════════════════════════
Recipient Address: 0x45a5aaa6693a5aaf7357acaef1e54f403f150fba
Current Balance: $10.40 USDC
Total Sent This Month: $0.10
Total Blocked This Month: $0.00
═══════════════════════════════════════════════════

✓ Workflow completed successfully!
```

## Security Considerations

1. **Hardcoded Address**: Prevents unauthorized recipient changes
2. **Balance Checks**: Ensures sufficient funds before approval
3. **Threshold Limits**: Prevents large unauthorized payments
4. **Monthly Budget**: Caps total spending per month
5. **Audit Trail**: Tracks all approved and blocked transactions

## Extending the Integration

### Custom Approval Logic

Add your own rules in the `can_use_tool()` function:

```python
# Example: Time-based restrictions
from datetime import datetime
if datetime.now().hour < 9 or datetime.now().hour > 17:
    return PermissionResultDeny(
        behavior='deny',
        message='Payments only allowed during business hours'
    )
```

### Multiple Recipients

Replace hardcoded address with a whitelist:

```python
allowed_recipients = [
    '0x45a5aaa6693a5aaf7357acaef1e54f403f150fba',
    '0x1234...',  # Add more addresses
]

recipient = tool_input.get('address', '')
if recipient not in allowed_recipients:
    return PermissionResultDeny(
        behavior='deny',
        message='Recipient not in whitelist'
    )
```

### Database Integration

Store wallet context in a database for persistence:

```python
import sqlite3

def save_wallet_context(context):
    conn = sqlite3.connect('wallet.db')
    # Save to database
    conn.close()
```

## Troubleshooting

### Balance Not Updating

If the balance doesn't update after the first query:
1. Check that Locus MCP is returning balance in the response
2. Verify the regex pattern matches the response format
3. Add debug logging to see the raw response

### Payments Always Denied

Check:
1. `wallet_context['balance']` is set correctly
2. Thresholds are configured appropriately
3. Monthly budget hasn't been exceeded

### Tool Not Found

Ensure:
1. Tool name starts with `mcp__locus__`
2. MCP server is configured correctly
3. `allowed_tools` includes the required tools

## Resources

- [Locus Documentation](https://docs.paywithlocus.com)
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk)
- [MCP Protocol](https://modelcontextprotocol.io)
