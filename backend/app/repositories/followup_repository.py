from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.followup import FollowUp


class FollowUpRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_owner(self, owner_id: str, only_pending: bool = False) -> list[FollowUp]:
        query = self.db.query(FollowUp).filter(FollowUp.owner_id == owner_id)
        if only_pending:
            query = query.filter(FollowUp.is_done.is_(False))
        return query.order_by(FollowUp.due_at.asc()).all()

    def get(self, followup_id: str, owner_id: str) -> FollowUp | None:
        return (
            self.db.query(FollowUp)
            .filter(FollowUp.id == followup_id, FollowUp.owner_id == owner_id)
            .first()
        )

    def create(self, **kwargs) -> FollowUp:
        followup = FollowUp(**kwargs)
        self.db.add(followup)
        self.db.commit()
        self.db.refresh(followup)
        return followup

    def update(self, followup: FollowUp, **kwargs) -> FollowUp:
        for key, value in kwargs.items():
            if value is not None:
                setattr(followup, key, value)
        self.db.commit()
        self.db.refresh(followup)
        return followup

    def delete(self, followup: FollowUp) -> None:
        self.db.delete(followup)
        self.db.commit()
