"""Notification service for CRUD operations on notifications."""
import uuid
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:
    """Handles notification creation, retrieval, and management."""

    @staticmethod
    def create(
        db: Session,
        user_id: uuid.UUID,
        workspace_id: uuid.UUID,
        type: str,
        title: str,
        body: str,
        action_url: str | None = None,
    ) -> Notification:
        """Create a new notification."""
        notification = Notification(
            id=uuid.uuid4(),
            user_id=user_id,
            workspace_id=workspace_id,
            type=type,
            title=title,
            body=body,
            action_url=action_url,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_unread(db: Session, user_id: uuid.UUID, limit: int = 50) -> list[Notification]:
        """Get unread notifications for a user."""
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id, not Notification.is_read)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_all(
        db: Session,
        user_id: uuid.UUID,
        type_filter: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Notification]:
        """Get all notifications for a user with optional filtering."""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if type_filter:
            query = query.filter(Notification.type == type_filter)
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def mark_read(db: Session, notification_id: uuid.UUID) -> Notification | None:
        """Mark a single notification as read."""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    @staticmethod
    def mark_all_read(db: Session, user_id: uuid.UUID) -> int:
        """Mark all notifications as read for a user. Returns count marked."""
        count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, not Notification.is_read)
            .update({"is_read": True})
        )
        db.commit()
        return count

    @staticmethod
    def get_unread_count(db: Session, user_id: uuid.UUID) -> int:
        """Get count of unread notifications for a user."""
        return (
            db.query(func.count(Notification.id))
            .filter(Notification.user_id == user_id, not Notification.is_read)
            .scalar()
        )

    @staticmethod
    def delete_old(db: Session, days: int = 90) -> int:
        """Delete notifications older than the given number of days. Returns count deleted."""
        cutoff = datetime.utcnow() - timedelta(days=days)
        count = db.query(Notification).filter(Notification.created_at < cutoff).delete()
        db.commit()
        return count
