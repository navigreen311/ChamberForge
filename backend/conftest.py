"""Root conftest for pytest."""
import os
import sys
from pathlib import Path

# Increase rate limits for testing BEFORE any app modules load
os.environ.setdefault("RATE_LIMIT_DEFAULT", "100000")
os.environ.setdefault("RATE_LIMIT_WORKSPACE", "100000")
os.environ.setdefault("RATE_LIMIT_AI", "100000")
os.environ.setdefault("RATE_LIMIT_EXPORT", "100000")
os.environ.setdefault("RATE_LIMIT_AUTH", "100000")

# Ensure the backend package is importable
sys.path.insert(0, str(Path(__file__).parent))
