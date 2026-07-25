from app.database.base import Base
from app.database.session.database import engine

# Import models so they register on Base.metadata before create_all runs.
from app.database.models import (  # noqa: F401
    Activity,
    Contact,
    Deal,
    FollowUp,
    Property,
    User,
)


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
