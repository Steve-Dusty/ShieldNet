"""ShieldNet FastAPI Backend"""
import os
from dotenv import load_dotenv

# Load environment variables FIRST (before importing routers)
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import invoices, threats, wallet, transactions

# Create FastAPI app
app = FastAPI(
    title="ShieldNet API",
    description="AI-powered invoice fraud detection with shared threat intelligence",
    version="1.0.0"
)

# Configure CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(invoices.router)
app.include_router(threats.router)
app.include_router(wallet.router)
app.include_router(transactions.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ShieldNet API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    return {
        "status": "healthy",
        "api_key_configured": bool(api_key),
        "api_key_prefix": api_key[:10] + "..." if api_key else None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
