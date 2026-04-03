"""Shared pytest configuration."""
import os

# Ensure no real API calls during tests
os.environ.setdefault("ANTHROPIC_API_KEY", "")
