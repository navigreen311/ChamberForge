"""Structured JSON logging configuration for ChamberForge."""
import json
import logging
import uuid
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Formats log records as JSON for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }

        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "workspace_id"):
            log_entry["workspace_id"] = record.workspace_id

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(level: int = logging.INFO) -> None:
    """Configure the root logger with JSON formatting."""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())

    root = logging.getLogger()
    # Avoid adding duplicate handlers on repeated calls
    if not any(isinstance(h, logging.StreamHandler) and isinstance(h.formatter, JSONFormatter) for h in root.handlers):
        root.addHandler(handler)
    root.setLevel(level)
