"""Global exception handlers — registered on the FastAPI app instance."""
import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom AppException subclasses with a consistent envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.detail["message"],
            "details": exc.details,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Translate Pydantic / FastAPI validation errors into the standard format."""
    field_errors: dict[str, str] = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"][1:])  # skip "body"
        field_errors[field] = error["msg"]
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": {"field_errors": field_errors},
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — never leak internals."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "details": None,
            "request_id": getattr(request.state, "request_id", None),
        },
    )
