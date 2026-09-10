"""FastAPI dependency injection helpers for auth and RBAC."""
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, AuthorizationError, BudgetError
from app.core.identity import ResolvedIdentity, resolve_identity
from app.core.security import decode_access_token
from app.db.session import get_db

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> ResolvedIdentity:
    """Extract and validate JWT from the Authorization header, return the User."""
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthenticationError("Invalid or expired token")

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise AuthenticationError("Token missing subject claim")

    # P-11 (T-063): identity comes from the Prisma-owned "User" table.
    #
    # This read `db.query(User)` - the FastAPI `users` table - which D4 made
    # non-authoritative. An operator created through the console exists in
    # Prisma and not in `users`, so every FastAPI-authenticated request was
    # resolving against a table nobody writes to. See app/core/identity.py
    # for how the workspace is resolved, since Prisma's User has no
    # workspace column.
    identity = resolve_identity(db, user_id)
    if identity is None or not identity.is_active:
        raise AuthenticationError("User not found or inactive")
    return identity


async def get_workspace_id(
    current_user: ResolvedIdentity = Depends(get_current_user),
) -> str:
    """The workspace every scoped query in this request filters on."""
    if not current_user.workspace_id:
        raise AuthorizationError("No workspace assigned")
    return str(current_user.workspace_id)


def require_role(*allowed_roles: str):
    """Return a dependency that enforces the user holds one of *allowed_roles*."""

    def dependency(current_user: ResolvedIdentity = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise AuthorizationError("Insufficient permissions")
        return current_user

    return dependency

# ----------------------------------------------------------------------
# P-00: frozen dependency signatures for the parallel build.
#
# These ship as working pass-throughs so the six router packages can
# annotate their routes on day one. The enforcement behind each signature
# is filled in later by the package named below, WITHOUT touching a single
# router. Do not change these signatures.
# ----------------------------------------------------------------------


def require_feature(feature: str):
    """Gate a route on a plan feature.

    Pass-through today. D2 put ChamberForge on one operator and one plan,
    so there is nothing to gate yet; P-05's entitlement engine is deferred
    until the white-label reseller tier arrives. Annotate routes now so
    that switching enforcement on is a one-file change in the engine
    rather than a sweep across 45 routers.
    """

    def dependency(current_user: ResolvedIdentity = Depends(get_current_user)) -> ResolvedIdentity:
        # Deliberate no-op. When entitlements are enabled this becomes:
        #   if not EntitlementEngine.check_feature(current_user, feature):
        #       raise AuthorizationError(f"Plan does not include {feature}")
        return current_user

    return dependency


def require_budget(operation: str = "ai"):
    """Refuse a route once its workspace is over its AI spend ceiling.

    P-04 filled this in. The signature is exactly the one P-00 froze, so
    routes annotated during the run began enforcing the moment this
    merged, with no router touched.

    This is the route-level half of the ceiling. The call-path half is in
    `base_agent.call_claude`, which refuses individual invocations. Both
    exist because they catch different things: this one stops a request
    that has not started, cheaply and before any work; the call-path one
    catches spend from jobs and agents that never came through a route.

    A workspace with no resolvable id is **not** refused here. That is not
    a budget question, and answering it here would turn a missing
    identity into a payment error; `get_workspace_id` is the gate for it.
    """

    def dependency(
        current_user: ResolvedIdentity = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> ResolvedIdentity:
        from app.services.backbone.budget_guard import BudgetExceeded, BudgetGuard

        if not current_user.workspace_id:
            return current_user
        try:
            BudgetGuard.assert_within_ceiling(
                db, current_user.workspace_id, operation=operation
            )
        except BudgetExceeded as exc:
            raise BudgetError(str(exc), exc.status.as_dict()) from exc
        return current_user

    return dependency
