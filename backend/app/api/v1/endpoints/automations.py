from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.automation_repository import AutomationRepository
from app.schemas.automation import (
    AutomationLogResponse,
    AutomationRuleResponse,
    AutomationRuleUpdate,
    AutomationRunResult,
)
from app.services.automation_service import run_daily_followup_reminders, run_site_visit_reminders, run_stale_lead_alert

router = APIRouter(prefix="/automations", tags=["Automations"])

_RUNNERS = {
    "daily_followup_reminder": run_daily_followup_reminders,
    "stale_lead_alert": run_stale_lead_alert,
    "site_visit_reminders": run_site_visit_reminders,
}


@router.get("", response_model=list[AutomationRuleResponse])
def list_automations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return AutomationRepository(db).ensure_defaults(user.id)


@router.patch("/{key}", response_model=AutomationRuleResponse)
def update_automation(
    key: str,
    payload: AutomationRuleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = AutomationRepository(db)
    repo.ensure_defaults(user.id)
    rule = repo.get_by_key(user.id, key)
    if rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation not found.")
    return repo.update(rule, **payload.model_dump(exclude_unset=True))


@router.post("/{key}/run", response_model=AutomationRunResult)
def run_automation_now(
    key: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Manually triggers an automation immediately, instead of waiting for the
    background scheduler — useful for testing that it actually works.
    Only "welcome_new_lead" can't be run this way since it's tied to the
    moment a contact is created, not a recurring schedule.
    """
    runner = _RUNNERS.get(key)
    if runner is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This automation runs automatically when its trigger happens and can't be run manually.",
        )
    result = runner(db, user)
    return AutomationRunResult(ran=result.get("ran", False), detail=result)


@router.get("/logs/recent", response_model=list[AutomationLogResponse])
def list_automation_logs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return AutomationRepository(db).list_logs(user.id, limit=50)
