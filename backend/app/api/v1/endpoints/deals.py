from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.deal_repository import DealRepository
from app.schemas.deal import DealCreate, DealResponse, DealUpdate

router = APIRouter(prefix="/deals", tags=["Deals / Pipeline"])


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
    data["stage"] = data["stage"].value if hasattr(data["stage"], "value") else data["stage"]
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
    if "stage" in data and hasattr(data["stage"], "value"):
        data["stage"] = data["stage"].value
    return repo.update(deal, **data)


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(deal_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = DealRepository(db)
    deal = repo.get(deal_id, user.id)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    repo.delete(deal)
    return None
