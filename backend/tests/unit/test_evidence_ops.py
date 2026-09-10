"""Tests for EvidenceOps backbone operations."""
import uuid
from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate
from app.services.backbone.evidence_ops import EvidenceOps


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    return db


@pytest.fixture
def sample_workspace_id():
    return uuid.uuid4()


@pytest.fixture
def sample_evidence_create(sample_workspace_id):
    return EvidenceCreate(
        workspace_id=sample_workspace_id,
        source_url="https://example.com/report.pdf",
        source_type="peer_reviewed",
        publication_date=date(2025, 6, 15),
        credibility_score=7.5,
        extracted_claims=[
            {"claim_text": "Test claim", "confidence": 0.9, "category": "factual"}
        ],
    )


def test_create_evidence(mock_db, sample_workspace_id, sample_evidence_create):
    """Test creating an evidence record."""
    mock_db.refresh = MagicMock()
    EvidenceOps.create(mock_db, sample_workspace_id, sample_evidence_create)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()

    added_obj = mock_db.add.call_args[0][0]
    assert isinstance(added_obj, Evidence)
    assert added_obj.source_url == "https://example.com/report.pdf"
    assert added_obj.source_type == "peer_reviewed"
    assert added_obj.credibility_score == 7.5


def test_get_evidence(mock_db):
    """Test getting an evidence record by ID."""
    eid = uuid.uuid4()
    fake_evidence = MagicMock(spec=Evidence)
    mock_db.query.return_value.filter.return_value.first.return_value = fake_evidence

    result = EvidenceOps.get(mock_db, eid)
    assert result == fake_evidence


def test_get_evidence_not_found(mock_db):
    """Test getting a non-existent evidence record."""
    mock_db.query.return_value.filter.return_value.first.return_value = None
    result = EvidenceOps.get(mock_db, uuid.uuid4())
    assert result is None


def test_list_evidence(mock_db, sample_workspace_id):
    """Test listing evidence with filters."""
    fake_list = [MagicMock(spec=Evidence), MagicMock(spec=Evidence)]
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.all.return_value = fake_list

    result = EvidenceOps.list(mock_db, sample_workspace_id)
    assert result == fake_list


def test_update_evidence(mock_db):
    """Test updating an evidence record."""
    eid = uuid.uuid4()
    fake_evidence = MagicMock(spec=Evidence)
    mock_db.query.return_value.filter.return_value.first.return_value = fake_evidence

    update_data = EvidenceUpdate(credibility_score=9.0)
    EvidenceOps.update(mock_db, eid, update_data)

    assert fake_evidence.credibility_score == 9.0
    mock_db.commit.assert_called_once()


def test_update_evidence_not_found(mock_db):
    """Test updating a non-existent evidence record."""
    mock_db.query.return_value.filter.return_value.first.return_value = None
    result = EvidenceOps.update(mock_db, uuid.uuid4(), EvidenceUpdate(credibility_score=5.0))
    assert result is None


def test_delete_evidence(mock_db):
    """Test deleting an evidence record."""
    fake_evidence = MagicMock(spec=Evidence)
    mock_db.query.return_value.filter.return_value.first.return_value = fake_evidence

    result = EvidenceOps.delete(mock_db, uuid.uuid4())
    assert result is True
    mock_db.delete.assert_called_once_with(fake_evidence)
    mock_db.commit.assert_called_once()


def test_delete_evidence_not_found(mock_db):
    """Test deleting a non-existent evidence record."""
    mock_db.query.return_value.filter.return_value.first.return_value = None
    result = EvidenceOps.delete(mock_db, uuid.uuid4())
    assert result is False


def test_link_to_problem(mock_db):
    """Test linking evidence to a problem."""
    eid = uuid.uuid4()
    pid = uuid.uuid4()
    fake_evidence = MagicMock(spec=Evidence)
    mock_db.query.return_value.filter.return_value.first.return_value = fake_evidence

    EvidenceOps.link_to_problem(mock_db, eid, pid)
    assert fake_evidence.problem_id == pid
    mock_db.commit.assert_called_once()


def test_check_duplicate_found(mock_db):
    """Test duplicate check when URL exists."""
    fake_evidence = MagicMock(spec=Evidence)
    mock_db.query.return_value.filter.return_value.first.return_value = fake_evidence

    result = EvidenceOps.check_duplicate(mock_db, "https://example.com/report.pdf")
    assert result == fake_evidence


def test_check_duplicate_not_found(mock_db):
    """Test duplicate check when URL does not exist."""
    mock_db.query.return_value.filter.return_value.first.return_value = None
    result = EvidenceOps.check_duplicate(mock_db, "https://example.com/new.pdf")
    assert result is None


def test_get_analyst_queue(mock_db, sample_workspace_id):
    """Test analyst queue returns items with low credibility or contradictions."""
    fake_list = [MagicMock(spec=Evidence)]
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.all.return_value = fake_list

    result = EvidenceOps.get_analyst_queue(mock_db, sample_workspace_id)
    assert result == fake_list


def test_recalculate_all_decay(mock_db, sample_workspace_id):
    """Test recalculate_all_decay updates all evidence records."""
    fake_ev1 = MagicMock(spec=Evidence)
    fake_ev1.credibility_score = 8.0
    fake_ev1.publication_date = date(2024, 1, 1)

    fake_ev2 = MagicMock(spec=Evidence)
    fake_ev2.credibility_score = 6.0
    fake_ev2.publication_date = date(2025, 6, 1)

    mock_db.query.return_value.filter.return_value.all.return_value = [fake_ev1, fake_ev2]

    with patch("app.services.backbone.evidence_ops.ResearchAI") as mock_ai_cls:
        mock_ai = MagicMock()
        mock_ai.compute_recency_decay.side_effect = [3.5, 5.8]
        mock_ai_cls.return_value = mock_ai

        count = EvidenceOps.recalculate_all_decay(mock_db, sample_workspace_id)

    assert count == 2
    assert fake_ev1.recency_decay_score == 3.5
    assert fake_ev2.recency_decay_score == 5.8
    mock_db.commit.assert_called_once()
