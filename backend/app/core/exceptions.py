"""Custom exception classes for consistent API error responses."""
from fastapi import HTTPException


class AppException(HTTPException):
    """Base exception for all application errors.

    Produces a consistent JSON envelope:
        {"error_code": "...", "message": "...", "details": {...}}
    """

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: dict | None = None,
    ):
        self.error_code = error_code
        self.details = details
        super().__init__(
            status_code=status_code,
            detail={
                "error_code": error_code,
                "message": message,
                "details": details,
            },
        )


class NotFoundError(AppException):
    def __init__(self, resource: str, resource_id: str | None = None):
        super().__init__(
            404,
            "NOT_FOUND",
            f"{resource} not found",
            {"resource": resource, "id": resource_id},
        )


class ValidationError(AppException):
    def __init__(self, message: str, field_errors: dict | None = None):
        super().__init__(
            422,
            "VALIDATION_ERROR",
            message,
            {"field_errors": field_errors},
        )


class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(401, "AUTHENTICATION_ERROR", message)


class AuthorizationError(AppException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(403, "AUTHORIZATION_ERROR", message)


class RateLimitError(AppException):
    def __init__(self, retry_after: int):
        super().__init__(
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests",
            {"retry_after": retry_after},
        )


class ConflictError(AppException):
    def __init__(self, message: str, resource: str | None = None):
        super().__init__(409, "CONFLICT", message, {"resource": resource})


class ExternalServiceError(AppException):
    def __init__(self, service: str, message: str):
        super().__init__(
            502,
            "EXTERNAL_SERVICE_ERROR",
            f"{service}: {message}",
            {"service": service},
        )
