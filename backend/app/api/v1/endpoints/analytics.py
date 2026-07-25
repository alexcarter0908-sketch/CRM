from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.services.analytics_service import (
    compute_lead_scores,
    conversion_funnel,
    lead_source_breakdown,
    sales_performance_report,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/lead-scores")
def get_lead_scores(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return compute_lead_scores(db, user.id)


@router.get("/sales-performance")
def get_sales_performance(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return sales_performance_report(db, user.id)


@router.get("/lead-sources")
def get_lead_sources(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return lead_source_breakdown(db, user.id)


@router.get("/conversion-funnel")
def get_conversion_funnel(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return conversion_funnel(db, user.id)
