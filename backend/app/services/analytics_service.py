"""
Predictive Analytics & Automated Reporting
-------------------------------------------
Every number produced here is computed directly from real rows in the
database (contacts, deals, activities, follow-ups). There is no external AI
model and nothing is randomly generated — this is a transparent, rule-based
scoring/aggregation layer, documented so anyone can audit exactly why a
contact got a given lead score, or where a report figure came from.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database.models.activity import Activity
from app.database.models.contact import Contact
from app.database.models.deal import Deal
from app.database.models.followup import FollowUp

_STAGE_POINTS = {
    "new": 5,
    "contacted": 10,
    "qualified": 15,
    "proposal": 20,
    "negotiation": 25,
    "won": 30,
    "lost": 0,
}


def _now():
    return datetime.now(timezone.utc)


def compute_lead_scores(db: Session, owner_id: str) -> list[dict]:
    """Lead score (0-100) per contact, built from four real signals:
    - Has an active deal at all               (up to 20 pts)
    - Furthest deal stage reached              (up to 30 pts)
    - Number of logged activities, capped      (up to 20 pts, 5 pts each, max 4)
    - Follow-up completion rate                (up to 15 pts)
    - Recency of last activity/follow-up       (up to 15 pts)
    """
    contacts = db.query(Contact).filter(Contact.owner_id == owner_id).all()
    deals = db.query(Deal).filter(Deal.owner_id == owner_id).all()
    activities = db.query(Activity).filter(Activity.created_by == owner_id).all()
    followups = db.query(FollowUp).filter(FollowUp.owner_id == owner_id).all()

    deals_by_contact: dict[str, list[Deal]] = defaultdict(list)
    for d in deals:
        deals_by_contact[d.contact_id].append(d)

    activities_by_contact: dict[str, list[Activity]] = defaultdict(list)
    for a in activities:
        activities_by_contact[a.contact_id].append(a)

    followups_by_contact: dict[str, list[FollowUp]] = defaultdict(list)
    for f in followups:
        followups_by_contact[f.contact_id].append(f)

    now = _now()
    results = []

    for contact in contacts:
        breakdown = []
        score = 0.0

        contact_deals = deals_by_contact.get(contact.id, [])
        if contact_deals:
            score += 20
            breakdown.append("Has at least one deal (+20)")
            best_stage_points = max(_STAGE_POINTS.get(d.stage, 0) for d in contact_deals)
            score += best_stage_points
            if best_stage_points:
                breakdown.append(f"Furthest deal stage reached earns +{best_stage_points}")
        else:
            breakdown.append("No deals yet (+0)")

        contact_activities = activities_by_contact.get(contact.id, [])
        activity_points = min(len(contact_activities) * 5, 20)
        score += activity_points
        breakdown.append(f"{len(contact_activities)} logged activit{'y' if len(contact_activities)==1 else 'ies'} (+{activity_points})")

        contact_followups = followups_by_contact.get(contact.id, [])
        if contact_followups:
            completed = sum(1 for f in contact_followups if f.is_done)
            ratio_points = round((completed / len(contact_followups)) * 15)
            score += ratio_points
            breakdown.append(f"{completed}/{len(contact_followups)} follow-ups completed (+{ratio_points})")
        else:
            breakdown.append("No follow-ups logged (+0)")

        last_dates = [a.created_at for a in contact_activities] + [f.due_at for f in contact_followups]
        if last_dates:
            most_recent = max(last_dates)
            if most_recent.tzinfo is None:
                most_recent = most_recent.replace(tzinfo=timezone.utc)
            days_ago = (now - most_recent).days
            if days_ago <= 7:
                score += 15
                breakdown.append("Active in the last 7 days (+15)")
            elif days_ago <= 30:
                score += 7
                breakdown.append("Active in the last 30 days (+7)")
            else:
                breakdown.append(f"Last activity was {days_ago} days ago (+0)")
        else:
            breakdown.append("No recorded activity or follow-up (+0)")

        results.append(
            {
                "contact_id": contact.id,
                "full_name": contact.full_name,
                "score": min(round(score), 100),
                "breakdown": breakdown,
            }
        )

    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def sales_performance_report(db: Session, owner_id: str) -> dict:
    """Monthly sales performance from real deals.

    Note: this schema doesn't track a separate "closed at" timestamp, so a
    won/lost deal's month is approximated using its `expected_close_date` if
    set, otherwise the date it was last updated. This is flagged clearly in
    the API response so it's never mistaken for exact data.
    """
    deals = db.query(Deal).filter(Deal.owner_id == owner_id).all()

    monthly: dict[str, dict] = defaultdict(lambda: {"won_count": 0, "won_value": 0.0, "created_count": 0})

    for d in deals:
        created_month = d.created_at.strftime("%Y-%m")
        monthly[created_month]["created_count"] += 1

        if d.stage == "won":
            close_date = d.expected_close_date or d.updated_at
            close_month = close_date.strftime("%Y-%m") if hasattr(close_date, "strftime") else created_month
            monthly[close_month]["won_count"] += 1
            monthly[close_month]["won_value"] += float(d.value or 0)

    ordered_months = sorted(monthly.keys())
    return {
        "months": [
            {"month": m, **monthly[m]}
            for m in ordered_months
        ],
        "note": "Won-deal months use expected_close_date if set, otherwise the deal's last-updated date, since close date isn't separately tracked yet.",
    }


def lead_source_breakdown(db: Session, owner_id: str) -> list[dict]:
    """Real breakdown of contacts and won value by their recorded `source` field."""
    contacts = db.query(Contact).filter(Contact.owner_id == owner_id).all()
    deals = db.query(Deal).filter(Deal.owner_id == owner_id).all()

    deals_by_contact: dict[str, list[Deal]] = defaultdict(list)
    for d in deals:
        deals_by_contact[d.contact_id].append(d)

    by_source: dict[str, dict] = defaultdict(lambda: {"contact_count": 0, "won_value": 0.0, "won_count": 0})

    for c in contacts:
        source = (c.source or "Unspecified").strip() or "Unspecified"
        by_source[source]["contact_count"] += 1
        for d in deals_by_contact.get(c.id, []):
            if d.stage == "won":
                by_source[source]["won_value"] += float(d.value or 0)
                by_source[source]["won_count"] += 1

    return [
        {"source": source, **stats}
        for source, stats in sorted(by_source.items(), key=lambda kv: kv[1]["contact_count"], reverse=True)
    ]


def conversion_funnel(db: Session, owner_id: str) -> list[dict]:
    """Real count of deals at each pipeline stage."""
    stages = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]
    deals = db.query(Deal).filter(Deal.owner_id == owner_id).all()
    counts = {s: 0 for s in stages}
    for d in deals:
        if d.stage in counts:
            counts[d.stage] += 1
    return [{"stage": s, "count": counts[s]} for s in stages]
