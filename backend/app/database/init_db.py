from sqlalchemy import inspect, text

from app.database.base import Base
from app.database.session.database import engine

# Import models so they register on Base.metadata before create_all runs.
from app.database.models import (  # noqa: F401
    Activity,
    AutomationLog,
    AutomationRule,
    Contact,
    Deal,
    Document,
    FollowUp,
    PaymentMilestone,
    PipelineStage,
    Property,
    PropertyView,
    SiteVisit,
    User,
)

# Columns added after the tables already existed in earlier versions of this
# app. create_all() only creates *missing tables* — it never alters existing
# ones — so any new column on a pre-existing table has to be patched in here.
# This keeps existing data (contacts, deals, etc.) intact across upgrades.
_COLUMN_PATCHES: dict[str, list[tuple[str, str]]] = {
    "contacts": [
        ("lead_status", "VARCHAR(20) NOT NULL DEFAULT 'warm'"),
        ("budget_min", "FLOAT"),
        ("budget_max", "FLOAT"),
        ("property_type", "VARCHAR(100)"),
        ("preferred_location", "VARCHAR(255)"),
    ],
    "followups": [
        ("last_reminder_sent_at", "TIMESTAMP WITH TIME ZONE"),
    ],
    "deals": [
        ("property_id", "VARCHAR(36) REFERENCES properties(id)"),
    ],
    "site_visits": [
        ("reminder_hours_before", "INTEGER NOT NULL DEFAULT 24"),
        ("reminder_sent", "BOOLEAN NOT NULL DEFAULT FALSE"),
    ],
}

# Deals created before customizable pipeline stages existed used a fixed set
# of stage keys. Once each user's real-estate-flavoured default stages are
# seeded, old deals are remapped onto the closest equivalent new stage so
# they don't end up "stuck" on a stage key that no longer exists anywhere.
_LEGACY_STAGE_MAP = {
    "new": "lead_in",
    "contacted": "needs_analysis",
    "qualified": "property_shown",
    "proposal": "offer_made",
    "won": "closed",
}


def _patch_missing_columns() -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table, columns in _COLUMN_PATCHES.items():
            if table not in existing_tables:
                # Table doesn't exist yet — create_all() will create it with
                # every column already in place, nothing to patch.
                continue

            existing_columns = {col["name"] for col in inspector.get_columns(table)}
            for column_name, ddl_type in columns:
                if column_name in existing_columns:
                    continue
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_name} {ddl_type}"))


def _migrate_legacy_deal_stages() -> None:
    from sqlalchemy.orm import Session

    from app.repositories.pipeline_stage_repository import PipelineStageRepository
    from app.repositories.user_repository import UserRepository

    with Session(engine) as db:
        users = UserRepository(db).list_all()
        for user in users:
            stage_repo = PipelineStageRepository(db)
            stages = stage_repo.ensure_defaults(user.id)
            stage_keys = {s.key for s in stages}
            for old_key, new_key in _LEGACY_STAGE_MAP.items():
                if old_key in stage_keys:
                    # User already has a stage using this exact key on purpose — leave it alone.
                    continue
                db.execute(
                    text("UPDATE deals SET stage = :new_key WHERE owner_id = :owner_id AND stage = :old_key"),
                    {"new_key": new_key, "owner_id": user.id, "old_key": old_key},
                )
        db.commit()


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
    _patch_missing_columns()
    _migrate_legacy_deal_stages()
