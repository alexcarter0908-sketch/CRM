from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.activity_repository import ActivityRepository
from app.schemas.activity import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("/contact/{contact_id}", response_model=list[ActivityResponse])
def list_activities_for_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return ActivityRepository(db).list_for_contact(contact_id)


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = payload.model_dump()
    data["type"] = data["type"].value if hasattr(data["type"], "value") else data["type"]
    return ActivityRepository(db).create(created_by=user.id, **data)
