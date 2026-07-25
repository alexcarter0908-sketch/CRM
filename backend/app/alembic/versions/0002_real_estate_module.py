"""real estate module: properties table, contact preference columns

Revision ID: 0002_real_estate
Revises: 0001_initial
Create Date: 2026-07-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_real_estate"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "properties",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("owner_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("property_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="available"),
        sa.Column("price", sa.Numeric(14, 2), nullable=True),
        sa.Column("city", sa.String(length=150), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("bathrooms", sa.Integer(), nullable=True),
        sa.Column("size_sqft", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_index("ix_properties_owner_id", "properties", ["owner_id"])
    op.create_index("ix_properties_property_type", "properties", ["property_type"])
    op.create_index("ix_properties_status", "properties", ["status"])
    op.create_index("ix_properties_city", "properties", ["city"])

    op.add_column("contacts", sa.Column("budget_min", sa.Numeric(14, 2), nullable=True))
    op.add_column("contacts", sa.Column("budget_max", sa.Numeric(14, 2), nullable=True))
    op.add_column("contacts", sa.Column("preferred_property_type", sa.String(length=50), nullable=True))
    op.add_column("contacts", sa.Column("preferred_city", sa.String(length=150), nullable=True))
    op.add_column("contacts", sa.Column("preferred_bedrooms", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("contacts", "preferred_bedrooms")
    op.drop_column("contacts", "preferred_city")
    op.drop_column("contacts", "preferred_property_type")
    op.drop_column("contacts", "budget_max")
    op.drop_column("contacts", "budget_min")
    op.drop_table("properties")
