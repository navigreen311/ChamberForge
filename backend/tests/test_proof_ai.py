"""Tests for ProofAI service."""
import pytest
from unittest.mock import patch

from app.services.agents.proof_ai import ProofAI


SAMPLE_OFFER = {
    "name": "Wealth Preservation Advisory",
    "delivery_model": "advisory",
    "value_stack": [
        {"name": "Estate planning review"},
        {"name": "Tax strategy optimization"},
        {"name": "Risk assessment"},
    ],
    "pricing_model": {"monthly_fee": 15000},
}


@pytest.fixture
def ai():
    with patch.object(ProofAI, "__init__", lambda self: setattr(self, "_client", None)):
        return ProofAI()


@pytest.mark.asyncio
async def test_kpi_stack_returns_five_or_more(ai):
    result = await ai.design_kpi_stack(SAMPLE_OFFER)
    assert isinstance(result, list)
    assert len(result) >= 5


@pytest.mark.asyncio
async def test_kpi_stack_item_structure(ai):
    result = await ai.design_kpi_stack(SAMPLE_OFFER)
    for kpi in result:
        assert "kpi_name" in kpi
        assert "measurement_method" in kpi
        assert "target" in kpi
        assert "frequency" in kpi
        assert "data_source" in kpi


@pytest.mark.asyncio
async def test_roi_framework_structure(ai):
    result = await ai.generate_roi_framework(SAMPLE_OFFER)
    assert "value_delivered" in result
    assert isinstance(result["value_delivered"], list)
    assert len(result["value_delivered"]) > 0
    assert "total_estimated_roi" in result
    assert "roi_multiple" in result
    assert "payback_period_months" in result

    for item in result["value_delivered"]:
        assert "category" in item
        assert "metric" in item
        assert "monetary_value" in item


@pytest.mark.asyncio
async def test_roi_multiple_is_positive(ai):
    result = await ai.generate_roi_framework(SAMPLE_OFFER)
    assert result["roi_multiple"] > 0


@pytest.mark.asyncio
async def test_case_study_template_structure(ai):
    result = await ai.build_case_study_template(SAMPLE_OFFER)
    assert "title" in result
    assert "sections" in result
    assert isinstance(result["sections"], list)
    assert len(result["sections"]) >= 3
    assert "recommended_length" in result
    assert "visual_assets_needed" in result
    assert isinstance(result["visual_assets_needed"], list)

    for section in result["sections"]:
        assert "heading" in section
        assert "content_guide" in section
        assert "data_points_needed" in section
