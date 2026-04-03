"""Enumeration types for ChamberForge models."""
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"


class WorkspacePlan(str, enum.Enum):
    core = "core"
    pro = "pro"
    enterprise = "enterprise"
