"""initial schema: users, contacts, deals, activities, followups

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-23

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("google_id", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True)

    op.create_table(
        "contacts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_contacts_owner_id", "contacts", ["owner_id"])
    op.create_index("ix_contacts_email", "contacts", ["email"])

    op.create_table(
        "deals",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("contact_id", sa.String(length=36), sa.ForeignKey("contacts.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Numeric(12, 2), nullable=True),
        sa.Column("stage", sa.String(length=50), nullable=False, server_default="new"),
        sa.Column("expected_close_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_deals_owner_id", "deals", ["owner_id"])
    op.create_index("ix_deals_contact_id", "deals", ["contact_id"])
    op.create_index("ix_deals_stage", "deals", ["stage"])

    op.create_table(
        "activities",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("contact_id", sa.String(length=36), sa.ForeignKey("contacts.id"), nullable=False),
        sa.Column("deal_id", sa.String(length=36), sa.ForeignKey("deals.id"), nullable=True),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
    )
    op.create_index("ix_activities_contact_id", "activities", ["contact_id"])
    op.create_index("ix_activities_deal_id", "activities", ["deal_id"])

    op.create_table(
        "followups",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("contact_id", sa.String(length=36), sa.ForeignKey("contacts.id"), nullable=False),
        sa.Column("deal_id", sa.String(length=36), sa.ForeignKey("deals.id"), nullable=True),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("is_done", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_followups_contact_id", "followups", ["contact_id"])
    op.create_index("ix_followups_deal_id", "followups", ["deal_id"])
    op.create_index("ix_followups_owner_id", "followups", ["owner_id"])
    op.create_index("ix_followups_due_at", "followups", ["due_at"])


def downgrade() -> None:
    op.drop_table("followups")
    op.drop_table("activities")
    op.drop_table("deals")
    op.drop_table("contacts")
    op.drop_table("users")
