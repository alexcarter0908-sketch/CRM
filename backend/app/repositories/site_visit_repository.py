from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.site_visit import SiteVisit


class SiteVisitRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_owner(self, owner_id: str, contact_id: str | None = None) -> list[SiteVisit]:
        query = self.db.query(SiteVisit).filter(SiteVisit.owner_id == owner_id)
        if contact_id:
            query = query.filter(SiteVisit.contact_id == contact_id)
        return query.order_by(SiteVisit.scheduled_at.desc()).all()

    def get(self, site_visit_id: str, owner_id: str) -> SiteVisit | None:
        return (
            self.db.query(SiteVisit)
            .filter(SiteVisit.id == site_visit_id, SiteVisit.owner_id == owner_id)
            .first()
        )

    def create(self, **kwargs) -> SiteVisit:
        visit = SiteVisit(**kwargs)
        self.db.add(visit)
        self.db.commit()
        self.db.refresh(visit)
        return visit

    def update(self, visit: SiteVisit, **kwargs) -> SiteVisit:
        for key, value in kwargs.items():
            if value is not None:
                setattr(visit, key, value)
        self.db.commit()
        self.db.refresh(visit)
        return visit

    def delete(self, visit: SiteVisit) -> None:
        self.db.delete(visit)
        self.db.commit()

    def list_due_reminders(self, owner_id: str) -> list[SiteVisit]:
        from datetime import datetime, timedelta, timezone

        now = datetime.now(timezone.utc)
        visits = (
            self.db.query(SiteVisit)
            .filter(
                SiteVisit.owner_id == owner_id,
                SiteVisit.status == "scheduled",
                SiteVisit.reminder_sent.is_(False),
                SiteVisit.scheduled_at >= now,
            )
            .all()
        )
        due = []
        for visit in visits:
            scheduled_at = visit.scheduled_at if visit.scheduled_at.tzinfo else visit.scheduled_at.replace(tzinfo=timezone.utc)
            remind_at = scheduled_at - timedelta(hours=visit.reminder_hours_before)
            if now >= remind_at:
                due.append(visit)
        return due

    def mark_reminder_sent(self, visit: SiteVisit) -> None:
        visit.reminder_sent = True
        self.db.commit()
