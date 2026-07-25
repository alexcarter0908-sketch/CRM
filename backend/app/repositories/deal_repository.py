from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.deal import Deal


class DealRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_owner(self, owner_id: str) -> list[Deal]:
        return (
            self.db.query(Deal)
            .filter(Deal.owner_id == owner_id)
            .order_by(Deal.created_at.desc())
            .all()
        )

    def get(self, deal_id: str, owner_id: str) -> Deal | None:
        return (
            self.db.query(Deal)
            .filter(Deal.id == deal_id, Deal.owner_id == owner_id)
            .first()
        )

    def create(self, **kwargs) -> Deal:
        deal = Deal(**kwargs)
        self.db.add(deal)
        self.db.commit()
        self.db.refresh(deal)
        return deal

    def update(self, deal: Deal, **kwargs) -> Deal:
        for key, value in kwargs.items():
            if value is not None:
                setattr(deal, key, value)
        self.db.commit()
        self.db.refresh(deal)
        return deal

    def delete(self, deal: Deal) -> None:
        self.db.delete(deal)
        self.db.commit()
