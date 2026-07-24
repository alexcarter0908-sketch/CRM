from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.followup_repository import FollowUpRepository
from app.schemas.followup import FollowUpCreate, FollowUpResponse, FollowUpUpdate

router = APIRouter(prefix="/followups", tags=["Follow-ups"])


@router.get("", response_model=list[FollowUpResponse])
def list_followups(
    only_pending: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return FollowUpRepository(db).list_for_owner(user.id, only_pending=only_pending)


@router.post("", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def create_followup(
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return FollowUpRepository(db).create(owner_id=user.id, **payload.model_dump())


@router.patch("/{followup_id}", response_model=FollowUpResponse)
def update_followup(
    followup_id: str,
    payload: FollowUpUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = FollowUpRepository(db)
    followup = repo.get(followup_id, user.id)
    if followup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found.")
    return repo.update(followup, **payload.model_dump(exclude_unset=True))


@router.delete("/{followup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_followup(
    followup_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = FollowUpRepository(db)
    followup = repo.get(followup_id, user.id)
    if followup is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found.")
    repo.delete(followup)
    return None
