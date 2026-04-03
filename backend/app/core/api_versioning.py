"""API versioning utilities — version header validation and deprecation decorator."""
from fastapi import Header, HTTPException


SUPPORTED_VERSIONS = ["2026-04-01"]


async def check_api_version(
    x_api_version: str = Header(default="2026-04-01"),
) -> str:
    """Accept API version date header for forward compatibility.

    Clients may send ``X-Api-Version`` to pin behaviour to a known release.
    If omitted the latest supported version is assumed.
    """
    if x_api_version not in SUPPORTED_VERSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported API version '{x_api_version}'. Supported: {SUPPORTED_VERSIONS}",
        )
    return x_api_version


def deprecated_endpoint(removal_date: str, alternative: str):
    """Mark an endpoint as deprecated.

    Adds a deprecation notice to the docstring so it surfaces in OpenAPI docs.

    Usage::

        @router.get("/old-endpoint")
        @deprecated_endpoint("2026-10-01", "/api/v2/new-endpoint")
        async def old_endpoint():
            ...
    """

    def decorator(func):
        original_doc = func.__doc__ or ""
        func.__doc__ = (
            f"DEPRECATED -- will be removed {removal_date}. "
            f"Use {alternative} instead.\n\n{original_doc}"
        )
        return func

    return decorator
