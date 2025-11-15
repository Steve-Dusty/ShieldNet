#!/usr/bin/env python3
"""Quick test to check which Claude models work"""
import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Try different model names - including newer ones for SDK 0.73.0
models_to_test = [
    "claude-sonnet-4-5-20250929",  # Claude Sonnet 4.5 - newest
    "claude-3-7-sonnet-20250219",   # Claude 3.7 Sonnet
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-opus-4-20250514",       # Claude Opus 4
]

print("Testing which models are available...\n")

for model in models_to_test:
    try:
        message = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        print(f"✓ {model} - WORKS")
    except Exception as e:
        print(f"✗ {model} - FAILED: {str(e)[:100]}")
