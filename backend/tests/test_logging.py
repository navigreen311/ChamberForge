"""Tests for structured JSON logging."""
import json
import logging

from app.core.logging_config import JSONFormatter


class TestJSONFormatter:
    """Verify JSONFormatter produces valid structured JSON."""

    def setup_method(self):
        self.formatter = JSONFormatter()

    def _make_record(self, msg: str = "test message", level: int = logging.INFO, **kwargs) -> logging.LogRecord:
        record = logging.LogRecord(
            name="test",
            level=level,
            pathname="test.py",
            lineno=1,
            msg=msg,
            args=(),
            exc_info=None,
        )
        for key, value in kwargs.items():
            setattr(record, key, value)
        return record

    def test_output_is_valid_json(self):
        record = self._make_record()
        output = self.formatter.format(record)
        parsed = json.loads(output)
        assert isinstance(parsed, dict)

    def test_required_fields_present(self):
        record = self._make_record("hello world")
        parsed = json.loads(self.formatter.format(record))
        assert parsed["level"] == "INFO"
        assert parsed["message"] == "hello world"
        assert "timestamp" in parsed
        assert "module" in parsed
        assert "function" in parsed

    def test_request_id_included_when_set(self):
        record = self._make_record(request_id="req-123")
        parsed = json.loads(self.formatter.format(record))
        assert parsed["request_id"] == "req-123"

    def test_user_id_included_when_set(self):
        record = self._make_record(user_id="user-abc")
        parsed = json.loads(self.formatter.format(record))
        assert parsed["user_id"] == "user-abc"

    def test_workspace_id_included_when_set(self):
        record = self._make_record(workspace_id="ws-456")
        parsed = json.loads(self.formatter.format(record))
        assert parsed["workspace_id"] == "ws-456"

    def test_optional_fields_absent_when_not_set(self):
        record = self._make_record()
        parsed = json.loads(self.formatter.format(record))
        assert "request_id" not in parsed
        assert "user_id" not in parsed
        assert "workspace_id" not in parsed

    def test_exception_included(self):
        try:
            raise ValueError("boom")
        except ValueError:
            import sys
            exc_info = sys.exc_info()

        record = self._make_record()
        record.exc_info = exc_info
        parsed = json.loads(self.formatter.format(record))
        assert "exception" in parsed
        assert "ValueError: boom" in parsed["exception"]
