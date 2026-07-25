from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database.models.automation import AutomationLog, AutomationRule

# The catalogue of automations this CRM actually knows how to run. Each key
# maps to real logic in services/automation_service.py — there is no rule
# here that isn't backed by a working implementation.
AUTOMATION_CATALOG: dict[str, dict] = {
    "daily_followup_reminder": {
        "name": "Daily follow-up reminders",
        "description": (
            "Every day, emails each contact who has a follow-up due today or overdue, "
            "using the follow-up note as the message. Logs an activity + skips contacts "
            "with no email on file."
        ),
        "default_config": {},
    },
    "welcome_new_lead": {
        "name": "Welcome new leads",
        "description": "Sends a welcome email the moment a new contact with an email address is added.",
        "default_config": {},
    },
    "stale_lead_alert": {
        "name": "Stale lead alert",
        "description": (
            "Every day, emails you (the account owner) a summary of contacts with no "
            "activity or follow-up in the configured number of days."
        ),
        "default_config": {"stale_days": 7},
    },
    "site_visit_reminders": {
        "name": "Site visit reminders",
        "description": (
            "Emails the contact a reminder before a scheduled site visit — how far in "
            "advance is set per visit (reminder_hours_before, default 24h)."
        ),
        "default_config": {},
    },
    "deal_stage_tasks": {
        "name": "Deal stage tasks",
        "description": (
            "The moment a deal moves to a new pipeline stage, automatically creates a "
            "follow-up task for that stage so nothing falls through."
        ),
        "default_config": {},
    },
    "property_view_alert": {
        "name": "Property view alert",
        "description": (
            "Emails you the moment a lead opens a shared property link — includes which "
            "property and which contact, generated from real view tracking, not a guess."
        ),
        "default_config": {},
    },
}


class AutomationRepository:
    def __init__(self, db: Session):
        self.db = db

    def ensure_defaults(self, owner_id: str) -> list[AutomationRule]:
        """Creates any automation rules the user doesn't have yet (idempotent)."""
        existing = {r.key: r for r in self.list_for_owner(owner_id)}
        created = False
        for key, meta in AUTOMATION_CATALOG.items():
            if key in existing:
                continue
            rule = AutomationRule(
                owner_id=owner_id,
                key=key,
                name=meta["name"],
                description=meta["description"],
                enabled=False,
                config=dict(meta["default_config"]),
            )
            self.db.add(rule)
            created = True
        if created:
            self.db.commit()
        return self.list_for_owner(owner_id)

    def list_for_owner(self, owner_id: str) -> list[AutomationRule]:
        return self.db.query(AutomationRule).filter(AutomationRule.owner_id == owner_id).all()

    def get_by_key(self, owner_id: str, key: str) -> AutomationRule | None:
        return (
            self.db.query(AutomationRule)
            .filter(AutomationRule.owner_id == owner_id, AutomationRule.key == key)
            .first()
        )

    def update(self, rule: AutomationRule, **kwargs) -> AutomationRule:
        for key, value in kwargs.items():
            if value is not None:
                setattr(rule, key, value)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def mark_run(self, rule: AutomationRule) -> AutomationRule:
        rule.last_run_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def add_log(self, rule: AutomationRule, owner_id: str, status: str, message: str, contact_id: str | None = None) -> AutomationLog:
        log = AutomationLog(
            automation_rule_id=rule.id,
            owner_id=owner_id,
            contact_id=contact_id,
            status=status,
            message=message,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list_logs(self, owner_id: str, limit: int = 50) -> list[AutomationLog]:
        return (
            self.db.query(AutomationLog)
            .filter(AutomationLog.owner_id == owner_id)
            .order_by(AutomationLog.created_at.desc())
            .limit(limit)
            .all()
        )
