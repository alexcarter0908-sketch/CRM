from app.api.v1.endpoints.activities import router as activities_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.automations import router as automations_router
from app.api.v1.endpoints.contacts import router as contacts_router
from app.api.v1.endpoints.deals import router as deals_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.followups import router as followups_router
from app.api.v1.endpoints.payment_milestones import router as payment_milestones_router
from app.api.v1.endpoints.pipeline_stages import router as pipeline_stages_router
from app.api.v1.endpoints.properties import router as properties_router
from app.api.v1.endpoints.public_tracking import router as public_tracking_router
from app.api.v1.endpoints.site_visits import router as site_visits_router
from app.api.v1.endpoints.users import router as users_router

__all__ = [
    "auth_router",
    "users_router",
    "contacts_router",
    "deals_router",
    "activities_router",
    "followups_router",
    "site_visits_router",
    "documents_router",
    "payment_milestones_router",
    "automations_router",
    "properties_router",
    "pipeline_stages_router",
    "public_tracking_router",
]
