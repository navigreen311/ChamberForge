"""Seed script — creates demo workspace, admin user, sample data, and playbooks.

Idempotent: skips records that already exist.
Usage:
    cd backend && python -m scripts.seed
    # or from repo root:
    python scripts/seed.py
"""
import os
import sys
import uuid
from datetime import datetime, timezone

# Allow running from repo root or from backend/
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
if os.path.isdir(backend_dir):
    sys.path.insert(0, backend_dir)
else:
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.db.session import Base
from app.core.config import settings

# Import all models so Base.metadata is complete
from app.models.user import User
from app.models.workspace import Workspace
from app.models.problem import Problem
from app.models.offer import Offer
from app.models.client import Client
from app.models.playbook import Playbook

# Import seed_playbooks data
try:
    # When running from repo root
    parent = os.path.join(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, parent)
    from seed_playbooks import PLAYBOOKS
except ImportError:
    PLAYBOOKS = []

# ── Constants ──

DEMO_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"
DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000002"
DEMO_ADMIN_EMAIL = "admin@chamberforge.dev"

NOW = datetime.now(timezone.utc)


def _hash_password(plain: str) -> str:
    """Simple hash for seeding — uses passlib bcrypt if available, else stores prefixed plain."""
    try:
        from passlib.context import CryptContext

        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.hash(plain)
    except ImportError:
        # Fallback: store with marker so app knows it is not truly hashed
        import hashlib

        return "sha256:" + hashlib.sha256(plain.encode()).hexdigest()


def seed(db: Session) -> None:
    """Run all seed operations inside the given session."""

    # ── 1. Demo workspace ──
    if not db.query(Workspace).filter_by(id=DEMO_WORKSPACE_ID).first():
        db.add(
            Workspace(
                id=DEMO_WORKSPACE_ID,
                name="Demo Workspace",
                slug="demo",
                plan="pro",
                owner_id=DEMO_ADMIN_ID,
                settings={"onboarded": True},
                created_at=NOW,
                updated_at=NOW,
            )
        )
        print("  + Created demo workspace")
    else:
        print("  . Demo workspace already exists")

    # ── 2. Admin user ──
    if not db.query(User).filter_by(email=DEMO_ADMIN_EMAIL).first():
        db.add(
            User(
                id=DEMO_ADMIN_ID,
                email=DEMO_ADMIN_EMAIL,
                name="Admin",
                hashed_password=_hash_password("changeme123"),
                role="admin",
                workspace_id=DEMO_WORKSPACE_ID,
                is_active=True,
                created_at=NOW,
                updated_at=NOW,
            )
        )
        print("  + Created admin user (admin@chamberforge.dev / changeme123)")
    else:
        print("  . Admin user already exists")

    db.flush()

    # ── 3. Sample problems ──
    sample_problems = [
        {
            "id": "00000000-0000-0000-0000-000000000010",
            "workspace_id": DEMO_WORKSPACE_ID,
            "title": "Multi-entity coordination overload",
            "description": "Newly wealthy founder with 5+ entities has no single coordination layer.",
            "status": "active",
            "created_by": DEMO_ADMIN_ID,
        },
        {
            "id": "00000000-0000-0000-0000-000000000011",
            "workspace_id": DEMO_WORKSPACE_ID,
            "title": "Data broker exposure risk",
            "description": "Executive's home address exposed on 50+ data broker sites.",
            "status": "active",
            "created_by": DEMO_ADMIN_ID,
        },
        {
            "id": "00000000-0000-0000-0000-000000000012",
            "workspace_id": DEMO_WORKSPACE_ID,
            "title": "Household staff vetting gaps",
            "description": "Principal discovered background check was never completed for estate manager.",
            "status": "active",
            "created_by": DEMO_ADMIN_ID,
        },
    ]
    for p in sample_problems:
        if not db.query(Problem).filter_by(id=p["id"]).first():
            db.add(Problem(**p, created_at=NOW, updated_at=NOW))
            print(f"  + Created problem: {p['title']}")
        else:
            print(f"  . Problem already exists: {p['title']}")

    # ── 4. Sample offers ──
    sample_offers = [
        {
            "id": "00000000-0000-0000-0000-000000000020",
            "workspace_id": DEMO_WORKSPACE_ID,
            "problem_id": "00000000-0000-0000-0000-000000000010",
            "name": "Private Ops Office — Starter",
            "delivery_model": "done_for_you",
            "status": "active",
        },
        {
            "id": "00000000-0000-0000-0000-000000000021",
            "workspace_id": DEMO_WORKSPACE_ID,
            "problem_id": "00000000-0000-0000-0000-000000000011",
            "name": "Footprint Reduction Sprint",
            "delivery_model": "done_for_you",
            "status": "draft",
        },
    ]
    for o in sample_offers:
        if not db.query(Offer).filter_by(id=o["id"]).first():
            db.add(Offer(**o, created_at=NOW, updated_at=NOW))
            print(f"  + Created offer: {o['name']}")
        else:
            print(f"  . Offer already exists: {o['name']}")

    # ── 5. Sample clients ──
    sample_clients = [
        {
            "id": "00000000-0000-0000-0000-000000000030",
            "workspace_id": DEMO_WORKSPACE_ID,
            "name": "James Worthington III",
            "company": "Worthington Family Office",
            "wealth_tier": "uhnw",
            "status": "active",
        },
        {
            "id": "00000000-0000-0000-0000-000000000031",
            "workspace_id": DEMO_WORKSPACE_ID,
            "name": "Olivia Chen",
            "company": "Chen Ventures",
            "wealth_tier": "hnw",
            "status": "prospect",
        },
    ]
    for c in sample_clients:
        if not db.query(Client).filter_by(id=c["id"]).first():
            db.add(Client(**c, created_at=NOW, updated_at=NOW))
            print(f"  + Created client: {c['name']}")
        else:
            print(f"  . Client already exists: {c['name']}")

    # ── 6. Playbooks ──
    if PLAYBOOKS:
        existing_slugs = {p.slug for p in db.query(Playbook.slug).all()}
        inserted = 0
        for data in PLAYBOOKS:
            if data["slug"] not in existing_slugs:
                db.add(Playbook(**data))
                inserted += 1
        if inserted:
            print(f"  + Seeded {inserted} playbooks")
        else:
            print(f"  . All {len(PLAYBOOKS)} playbooks already exist")
    else:
        print("  . No playbook data found (seed_playbooks.py not on path)")

    db.commit()
    print("\nSeed complete.")


def main() -> None:
    database_url = os.environ.get("DATABASE_URL", settings.DATABASE_URL)
    print(f"Seeding database: {database_url.split('@')[-1] if '@' in database_url else database_url}")

    engine = create_engine(database_url, pool_pre_ping=True)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        seed(db)


if __name__ == "__main__":
    main()
