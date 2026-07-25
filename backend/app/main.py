import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import (
    activities_router,
    auth_router,
    automations_router,
    contacts_router,
    deals_router,
    documents_router,
    followups_router,
    payment_milestones_router,
    pipeline_stages_router,
    properties_router,
    public_tracking_router,
    site_visits_router,
    users_router,
)
from app.core.config.settings import settings
from app.database.init_db import init_database
from app.database.session.database import SessionLocal
from app.repositories.automation_repository import AutomationRepository
from app.repositories.user_repository import UserRepository
from app.services.automation_service import run_all_daily_automations_for_user

logger = logging.getLogger("automations.scheduler")

scheduler = BackgroundScheduler()


def run_automations_for_all_users() -> None:
    """
    The job the background scheduler calls periodically. Runs each user's
    enabled automations against their own data — every user only ever
    triggers automations on their own contacts/follow-ups.
    """
    db = SessionLocal()
    try:
        users = UserRepository(db).list_all()
        for user in users:
            AutomationRepository(db).ensure_defaults(user.id)
            try:
                run_all_daily_automations_for_user(db, user)
            except Exception:  # noqa: BLE001 — one user's failure shouldn't stop the rest
                logger.exception("Automation run failed for user %s", user.id)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    scheduler.add_job(
        run_automations_for_all_users,
        trigger="interval",
        minutes=settings.AUTOMATION_INTERVAL_MINUTES,
        id="daily_automations",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CRM Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(contacts_router, prefix=settings.API_V1_PREFIX)
app.include_router(deals_router, prefix=settings.API_V1_PREFIX)
app.include_router(activities_router, prefix=settings.API_V1_PREFIX)
app.include_router(followups_router, prefix=settings.API_V1_PREFIX)
app.include_router(site_visits_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(payment_milestones_router, prefix=settings.API_V1_PREFIX)
app.include_router(automations_router, prefix=settings.API_V1_PREFIX)
app.include_router(properties_router, prefix=settings.API_V1_PREFIX)
app.include_router(pipeline_stages_router, prefix=settings.API_V1_PREFIX)
app.include_router(public_tracking_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["System"])
async def health():
    return {"status": "healthy", "application": settings.APP_NAME, "version": settings.APP_VERSION}
