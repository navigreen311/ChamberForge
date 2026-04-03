"""Playbook model — stores vertical playbook templates."""
import uuid

from sqlalchemy import Column, String, Float, JSON

from app.db.session import Base
from app.models.types import GUID


class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    target_buyer = Column(String, nullable=False)
    price_range_min = Column(Float, nullable=False)
    price_range_max = Column(Float, nullable=False)
    core_pain = Column(String, nullable=False)
    icp = Column(JSON, nullable=False, default=dict)
    pain_triggers = Column(JSON, nullable=False, default=list)
    pricing_model = Column(JSON, nullable=False, default=dict)
    sop_skeleton = Column(JSON, nullable=False, default=list)
    trust_concerns = Column(JSON, nullable=False, default=list)
    objection_handling = Column(JSON, nullable=False, default=list)
    kpi_stack = Column(JSON, nullable=False, default=list)
    voiceforge_assets = Column(JSON, nullable=False, default=list)
    visionaudio_assets = Column(JSON, nullable=False, default=list)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "slug": self.slug,
            "name": self.name,
            "target_buyer": self.target_buyer,
            "price_range_min": self.price_range_min,
            "price_range_max": self.price_range_max,
            "core_pain": self.core_pain,
            "icp": self.icp,
            "pain_triggers": self.pain_triggers,
            "pricing_model": self.pricing_model,
            "sop_skeleton": self.sop_skeleton,
            "trust_concerns": self.trust_concerns,
            "objection_handling": self.objection_handling,
            "kpi_stack": self.kpi_stack,
            "voiceforge_assets": self.voiceforge_assets,
            "visionaudio_assets": self.visionaudio_assets,
        }
