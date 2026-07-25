from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config.settings import settings
from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.property_repository import PropertyRepository
from app.repositories.property_view_repository import PropertyViewRepository
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from app.schemas.property_view import PropertyViewResponse, ShareLinkRequest, ShareLinkResponse

router = APIRouter(prefix="/properties", tags=["Properties"])


def _normalize(data: dict) -> dict:
    if "status" in data and hasattr(data["status"], "value"):
        data["status"] = data["status"].value
    return data


@router.get("", response_model=list[PropertyResponse])
def list_properties(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return PropertyRepository(db).list_for_owner(user.id)


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = _normalize(payload.model_dump())
    return PropertyRepository(db).create(owner_id=user.id, **data)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = PropertyRepository(db).get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    return prop


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = PropertyRepository(db)
    prop = repo.get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    data = _normalize(payload.model_dump(exclude_unset=True))
    return repo.update(prop, **data)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = PropertyRepository(db)
    prop = repo.get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    linked_deals = repo.count_linked_deals(property_id)
    if linked_deals > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can't delete — {linked_deals} deal(s) are still linked to this property. Unlink or delete them first.",
        )
    repo.delete(prop)
    return None


@router.post("/{property_id}/share-link", response_model=ShareLinkResponse, status_code=status.HTTP_201_CREATED)
def create_share_link(
    property_id: str,
    payload: ShareLinkRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Creates a real, trackable public link for this property. When it's
    opened, the view is logged and the property_view_alert automation fires."""
    prop = PropertyRepository(db).get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

    row = PropertyViewRepository(db).create(owner_id=user.id, property_id=property_id, contact_id=payload.contact_id)
    url = f"{settings.FRONTEND_URL}/listings/{row.token}"
    return ShareLinkResponse(token=row.token, url=url)


@router.get("/{property_id}/views", response_model=list[PropertyViewResponse])
def list_property_views(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = PropertyRepository(db).get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    return PropertyViewRepository(db).list_for_property(property_id, user.id)
