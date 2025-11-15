# ShieldNet Backend API

FastAPI backend for ShieldNet - AI-powered invoice fraud detection with shared threat intelligence.

## Features

- 📄 **PDF Invoice Analysis** - Upload and analyze invoices using Claude SDK vision API
- 🛡️ **Fraud Detection** - Multi-agent AI fraud detection with local checks and network signals
- 🌐 **Threat Network** - Shared threat intelligence across the network
- 💰 **Treasury Management** - USDC wallet tracking and transaction history
- 📊 **Analytics Dashboard** - Comprehensive threat analytics and statistics

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Claude SDK** - Anthropic's Claude AI for invoice analysis
- **In-Memory Storage** - No database required (development mode)
- **Pydantic** - Data validation and serialization

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## API Endpoints

### Invoice Analysis
- `POST /api/invoices/analyze` - Upload and analyze invoice (PDF/PNG/JPG)

### Threat Intelligence
- `GET /api/threats/analytics` - Get threat analytics dashboard data
- `POST /api/threats/report` - Report a threat to the network

### Treasury
- `GET /api/wallet/balance` - Get wallet balance and statistics
- `GET /api/transactions` - Get transaction history

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── uploads/                # PDF storage directory
└── app/
    ├── models.py          # Pydantic models
    ├── storage.py         # In-memory data storage
    ├── analyzer.py        # Claude SDK invoice analyzer
    └── routers/
        ├── invoices.py    # Invoice analysis endpoints
        ├── threats.py     # Threat analytics endpoints
        ├── wallet.py      # Wallet endpoints
        └── transactions.py # Transaction endpoints
```

## How It Works

### Invoice Analysis Flow

1. **Upload**: Client uploads PDF/image invoice
2. **OCR/Vision**: Claude SDK analyzes the invoice image
3. **Fraud Detection**: AI runs local checks:
   - PO matching
   - Hours verification
   - Vendor trust check
   - Amount reasonableness
4. **Network Query**: Check against threat database
5. **Decision**: Returns APPROVED, HOLD, or BLOCKED
6. **Auto-Report**: If blocked, automatically reports to threat network

### Claude SDK Integration

The backend uses Claude's vision API to analyze invoice PDFs and images:

```python
# No pypdf needed! Claude reads PDFs directly
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[{
        "role": "user",
        "content": [{
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64_encoded_pdf
            }
        }]
    }]
)
```

### In-Memory Storage

All data is stored in Python dictionaries (no database):

- `invoices_db` - Analyzed invoices
- `threats_db` - Threat records
- `transactions_db` - Transaction history
- `wallet_state` - Wallet balance

**Note**: Data is lost when the server restarts. For production, replace with a real database.

## Testing

### Test Invoice Upload

```bash
curl -X POST "http://localhost:8000/api/invoices/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_invoice.pdf"
```

### Test Endpoints

```bash
# Get threat analytics
curl http://localhost:8000/api/threats/analytics

# Get wallet balance
curl http://localhost:8000/api/wallet/balance

# Get transactions
curl http://localhost:8000/api/transactions
```

## Development

### Adding New Features

1. Add Pydantic models to `app/models.py`
2. Add storage functions to `app/storage.py`
3. Create router in `app/routers/`
4. Register router in `main.py`

### Customizing Fraud Detection

Edit `app/analyzer.py` to modify:
- Fraud scoring logic
- Local check rules
- Network signal generation

## Environment Variables

- `ANTHROPIC_API_KEY` - Required. Your Anthropic API key for Claude SDK

## CORS Configuration

By default, CORS is enabled for:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev)

Add more origins in `main.py` if needed.

## License

MIT
