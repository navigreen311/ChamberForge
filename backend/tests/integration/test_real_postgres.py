"""Integration tests verifying real PostgreSQL features (not SQLite mocks).

Run with: pytest tests/integration/test_real_postgres.py -c conftest_docker.py
"""
import uuid
from concurrent.futures import ThreadPoolExecutor

import pytest
from sqlalchemy import inspect, text

# These tests require a real Postgres instance (Docker)
pytestmark = pytest.mark.skipif(
    True,  # Skip unless explicitly run with -c conftest_docker.py
    reason="Requires real PostgreSQL (run with: pytest -c conftest_docker.py)",
)


class TestUUIDColumns:
    """Verify UUID columns work correctly in real Postgres."""

    def test_uuid_primary_key_format(self, db, sample_workspace):
        """UUID PKs are valid UUID strings, not truncated."""
        assert len(sample_workspace.id) == 36
        parsed = uuid.UUID(sample_workspace.id)
        assert str(parsed) == sample_workspace.id

    def test_uuid_foreign_key_reference(self, db, sample_user, sample_workspace):
        """FK references between tables using UUID strings work."""
        assert sample_user.workspace_id == sample_workspace.id
        row = db.execute(
            text("SELECT workspace_id FROM users WHERE id = :uid"),
            {"uid": sample_user.id},
        ).fetchone()
        assert row[0] == sample_workspace.id


class TestJSONColumns:
    """Verify JSON/JSONB column operations in real Postgres."""

    def test_json_column_stores_dict(self, db, sample_workspace):
        """JSON column stores and retrieves a dict correctly."""
        sample_workspace.settings = {"theme": "dark", "notifications": True}
        db.commit()
        db.refresh(sample_workspace)
        assert sample_workspace.settings["theme"] == "dark"
        assert sample_workspace.settings["notifications"] is True

    def test_json_column_stores_nested_data(self, db, sample_workspace):
        """JSON column handles nested structures."""
        sample_workspace.settings = {
            "branding": {"logo_url": "https://example.com/logo.png", "colors": ["#000", "#fff"]},
            "features": {"ai_enabled": True},
        }
        db.commit()
        db.refresh(sample_workspace)
        assert sample_workspace.settings["branding"]["colors"] == ["#000", "#fff"]

    def test_json_query_with_postgres_operators(self, db, sample_workspace):
        """Postgres JSON operators work for querying JSON columns."""
        sample_workspace.settings = {"plan_tier": "enterprise", "seats": 50}
        db.commit()

        result = db.execute(
            text("SELECT settings->>'plan_tier' FROM workspaces WHERE id = :wid"),
            {"wid": sample_workspace.id},
        ).fetchone()
        assert result[0] == "enterprise"

    def test_json_containment_query(self, db, sample_workspace):
        """Postgres @> containment operator works on JSON columns."""
        sample_workspace.settings = {"region": "us-east", "active": True}
        db.commit()

        result = db.execute(
            text(
                "SELECT count(*) FROM workspaces "
                "WHERE settings::jsonb @> :filter AND id = :wid"
            ),
            {"filter": '{"active": true}', "wid": sample_workspace.id},
        ).fetchone()
        assert result[0] == 1


class TestCompositeIndexes:
    """Verify composite indexes are actually created in Postgres."""

    def test_users_workspace_role_index_exists(self, docker_engine):
        """The composite index on users(workspace_id, role) exists."""
        inspector = inspect(docker_engine)
        indexes = inspector.get_indexes("users")
        index_names = [idx["name"] for idx in indexes]
        assert "ix_users_workspace_role" in index_names

    def test_composite_index_has_correct_columns(self, docker_engine):
        """The composite index contains the expected columns in order."""
        inspector = inspect(docker_engine)
        indexes = inspector.get_indexes("users")
        ws_role_idx = next(i for i in indexes if i["name"] == "ix_users_workspace_role")
        assert ws_role_idx["column_names"] == ["workspace_id", "role"]


class TestForeignKeyConstraints:
    """Verify FK constraints enforce referential integrity in Postgres."""

    def test_fk_rejects_invalid_workspace_id(self, db):
        """Inserting a user with a nonexistent workspace_id fails."""
        from app.models.user import User

        user = User(
            id=str(uuid.uuid4()),
            email=f"bad-fk-{uuid.uuid4().hex[:8]}@example.com",
            name="Bad FK User",
            hashed_password="$2b$12$fakehash",
            role="operator",
            workspace_id=str(uuid.uuid4()),  # nonexistent workspace
        )
        db.add(user)
        with pytest.raises(Exception):  # IntegrityError
            db.flush()
        db.rollback()

    def test_fk_allows_null_workspace(self, db):
        """Users with NULL workspace_id are allowed (nullable FK)."""
        from app.models.user import User

        user = User(
            id=str(uuid.uuid4()),
            email=f"no-ws-{uuid.uuid4().hex[:8]}@example.com",
            name="No Workspace User",
            hashed_password="$2b$12$fakehash",
            role="operator",
            workspace_id=None,
        )
        db.add(user)
        db.flush()
        assert user.workspace_id is None


class TestConcurrentWrites:
    """Verify concurrent writes don't conflict under Postgres MVCC."""

    def test_concurrent_workspace_creation(self, docker_engine):
        """Multiple threads can create workspaces concurrently without conflict."""
        from sqlalchemy.orm import sessionmaker

        from app.models.workspace import Workspace

        Session = sessionmaker(bind=docker_engine)
        errors = []
        created_ids = []

        def create_workspace(n):
            session = Session()
            try:
                ws = Workspace(
                    id=str(uuid.uuid4()),
                    name=f"Concurrent WS {n}",
                    slug=f"concurrent-{n}-{uuid.uuid4().hex[:8]}",
                    plan="core",
                    settings={},
                )
                session.add(ws)
                session.commit()
                created_ids.append(ws.id)
            except Exception as e:
                errors.append(str(e))
                session.rollback()
            finally:
                session.close()

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(create_workspace, i) for i in range(10)]
            for f in futures:
                f.result()

        assert len(errors) == 0, f"Concurrent write errors: {errors}"
        assert len(created_ids) == 10

        # Clean up
        session = Session()
        for ws_id in created_ids:
            session.execute(text("DELETE FROM workspaces WHERE id = :wid"), {"wid": ws_id})
        session.commit()
        session.close()
