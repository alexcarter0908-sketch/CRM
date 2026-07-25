from app.api.v1.endpoints.activities import router as activities_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.contacts import router as contacts_router
from app.api.v1.endpoints.deals import router as deals_router
from app.api.v1.endpoints.followups import router as followups_router
from app.api.v1.endpoints.properties import router as properties_router
from app.api.v1.endpoints.users import router as users_router

__all__ = [
    "auth_router",
    "users_router",
    "contacts_router",
    "deals_router",
    "activities_router",
    "followups_router",
    "properties_router",
    "analytics_router",
]
