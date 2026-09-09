"""FastAPI dependency injection helpers for auth and RBAC."""
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate JWT from the Authorization header, return the User."""
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthenticationError("Invalid or expired token")

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise AuthenticationError("Token missing subject claim")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise AuthenticationError("User not found or inactive")
    return user


async def get_workspace_id(current_user: User = Depends(get_current_user)) -> str:
    """Extract workspace_id from the authenticated user, enforcing tenant context."""
    if not current_user.workspace_id:
        raise AuthorizationError("No workspace assigned")
    return str(current_user.workspace_id)


def require_role(*allowed_roles: str):
    """Return a dependency that enforces the user holds one of *allowed_roles*."""

    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise AuthorizationError("Insufficient permissions")
        return current_user

    return dependency
