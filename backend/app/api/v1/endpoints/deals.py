from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.deal_repository import DealRepository
from app.repositories.pipeline_stage_repository import PipelineStageRepository
from app.repositories.property_repository import PropertyRepository
from app.schemas.deal import DealCreate, DealResponse, DealUpdate
from app.services.automation_service import maybe_create_stage_task

router = APIRouter(prefix="/deals", tags=["Deals / Pipeline"])


def _validate_stage(db: Session, user_id: str, stage_key: str | None) -> str:
    stage_repo = PipelineStageRepository(db)
    stages = stage_repo.ensure_defaults(user_id)
    if stage_key is None:
        return stages[0].key
    if not any(s.key == stage_key for s in stages):
        valid = ", ".join(s.key for s in stages)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown pipeline stage '{stage_key}'. Valid stages: {valid}.",
        )
    return stage_key


def _validate_property(db: Session, user_id: str, property_id: str | None) -> None:
    if property_id is None:
        return
    if PropertyRepository(db).get(property_id, user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")


@router.get("", response_model=list[DealResponse])
def list_deals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return DealRepository(db).list_for_owner(user.id)


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    payload: DealCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = payload.model_dump()
    data["stage"] = _validate_stage(db, user.id, data.get("stage"))
    _validate_property(db, user.id, data.get("property_id"))
    return DealRepository(db).create(owner_id=user.id, **data)


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deal = DealRepository(db).get(deal_id, user.id)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    return deal


@router.patch("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: str,
    payload: DealUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = DealRepository(db)
    deal = repo.get(deal_id, user.id)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    data = payload.model_dump(exclude_unset=True)
    previous_stage = deal.stage
    if "stage" in data:
        data["stage"] = _validate_stage(db, user.id, data["stage"])
    if "property_id" in data:
        _validate_property(db, user.id, data["property_id"])
        # property_id may be explicitly cleared to null (unlinking a property),
        # so it's set directly rather than through the generic "skip None" update.
        deal.property_id = data.pop("property_id")
    updated = repo.update(deal, **data)

    if "stage" in data and data["stage"] != previous_stage:
        stage_obj = PipelineStageRepository(db).get_by_key(user.id, updated.stage)
        stage_label = stage_obj.label if stage_obj else updated.stage
        maybe_create_stage_task(db, user, updated, stage_label)

    return updated


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(deal_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = DealRepository(db)
    deal = repo.get(deal_id, user.id)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    repo.delete(deal)
    return None
