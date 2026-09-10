"""Database session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:
    """Yield a request-scoped session.

    P-02 note: this signature is FROZEN for the parallel build - nine
    packages depend on `Depends(get_db)` resolving to a plain Session, and
    changing it would touch every router at once.

    Scoping therefore does not live here. It is bound to the request by
    TenantMiddleware and applied at query time through
    `app.db.scope.scoped_query`. Putting a global filter on the sessionmaker
    was the alternative; it was rejected because it silently changes what
    every existing `db.query(...)` returns, including the 25 files that still
    read the legacy domain tables, and a silent change to what a query
    returns is the hardest kind of bug to find.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
