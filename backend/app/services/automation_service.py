from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.email import send_email
from app.database.models.activity import Activity
from app.database.models.contact import Contact
from app.database.models.deal import Deal
from app.database.models.followup import FollowUp
from app.database.models.property import Property
from app.database.models.user import User
from app.repositories.automation_repository import AutomationRepository
from app.repositories.followup_repository import FollowUpRepository
from app.repositories.site_visit_repository import SiteVisitRepository


def _now() -> datetime:
    return datetime.now(timezone.utc)


def run_daily_followup_reminders(db: Session, user: User) -> dict:
    """
    For every not-done follow-up owned by `user` that's due today or overdue,
    email the contact using the follow-up note as the message. Each follow-up
    is only reminded once per day (tracked via last_reminder_sent_at).
    """
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "daily_followup_reminder")
    if rule is None or not rule.enabled:
        return {"ran": False, "reason": "Automation is disabled."}

    cutoff = _now()
    followups = (
        db.query(FollowUp)
        .filter(
            FollowUp.owner_id == user.id,
            FollowUp.is_done.is_(False),
            FollowUp.due_at <= cutoff,
        )
        .all()
    )

    sent, skipped = 0, 0
    for followup in followups:
        already_today = (
            followup.last_reminder_sent_at is not None
            and followup.last_reminder_sent_at.date() == cutoff.date()
        )
        if already_today:
            continue

        contact = db.query(Contact).filter(Contact.id == followup.contact_id).first()
        if contact is None:
            continue

        subject = f"Following up: {followup.note or 'checking in'}"
        body = (
            f"Hi {contact.full_name.split(' ')[0]},\n\n"
            f"{followup.note or 'Just checking in regarding your inquiry.'}\n\n"
            f"Let me know if you have any questions — happy to help.\n\n"
            f"Best,\n{user.full_name}"
        )
        result = send_email(contact.email or "", subject, body)

        if result.sent:
            sent += 1
            db.add(Activity(contact_id=contact.id, created_by=user.id, type="email", content=f"Automated follow-up reminder sent: {subject}"))
            repo.add_log(rule, user.id, status="sent", message=f"Reminder sent to {contact.full_name}.", contact_id=contact.id)
        else:
            skipped += 1
            repo.add_log(rule, user.id, status="skipped", message=f"{contact.full_name}: {result.reason}", contact_id=contact.id)

        followup.last_reminder_sent_at = cutoff
        db.commit()

    repo.mark_run(rule)
    return {"ran": True, "sent": sent, "skipped": skipped, "checked": len(followups)}


def maybe_send_welcome_email(db: Session, user: User, contact: Contact) -> None:
    """Fires once, right when a new contact is created — not part of the daily schedule."""
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "welcome_new_lead")
    if rule is None or not rule.enabled:
        return

    subject = f"Welcome, {contact.full_name.split(' ')[0]}!"
    body = (
        f"Hi {contact.full_name.split(' ')[0]},\n\n"
        f"Thanks for your interest — I'm {user.full_name} and I'll be helping you find the "
        f"right property. I'll be in touch shortly with some options.\n\n"
        f"Best,\n{user.full_name}"
    )
    result = send_email(contact.email or "", subject, body)

    if result.sent:
        db.add(Activity(contact_id=contact.id, created_by=user.id, type="email", content=f"Automated welcome email sent: {subject}"))
        db.commit()
        repo.add_log(rule, user.id, status="sent", message=f"Welcome email sent to {contact.full_name}.", contact_id=contact.id)
    else:
        repo.add_log(rule, user.id, status="skipped", message=f"{contact.full_name}: {result.reason}", contact_id=contact.id)
    repo.mark_run(rule)


def run_stale_lead_alert(db: Session, user: User) -> dict:
    """
    Emails the agent (not the client) a summary of contacts with no follow-up
    created in the configured number of days — a real internal nudge, not a
    fabricated "12 companies showing high intent" style demo stat.
    """
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "stale_lead_alert")
    if rule is None or not rule.enabled:
        return {"ran": False, "reason": "Automation is disabled."}

    stale_days = int((rule.config or {}).get("stale_days", 7))
    cutoff = _now() - timedelta(days=stale_days)

    contacts = db.query(Contact).filter(Contact.owner_id == user.id).all()
    stale_contacts = []
    for contact in contacts:
        latest_followup = (
            db.query(FollowUp)
            .filter(FollowUp.contact_id == contact.id)
            .order_by(FollowUp.created_at.desc())
            .first()
        )
        latest_activity = (
            db.query(Activity)
            .filter(Activity.contact_id == contact.id)
            .order_by(Activity.created_at.desc())
            .first()
        )
        last_touch = max(
            [d for d in [latest_followup.created_at if latest_followup else None,
                         latest_activity.created_at if latest_activity else None,
                         contact.created_at] if d is not None]
        )
        if last_touch <= cutoff:
            stale_contacts.append(contact)

    if not stale_contacts:
        repo.mark_run(rule)
        repo.add_log(rule, user.id, status="skipped", message=f"No leads stale for {stale_days}+ days.")
        return {"ran": True, "stale_count": 0}

    lines = "\n".join(f"- {c.full_name} ({c.email or 'no email'})" for c in stale_contacts)
    subject = f"{len(stale_contacts)} lead(s) haven't been touched in {stale_days}+ days"
    body = f"Hi {user.full_name},\n\nThese leads have had no activity or follow-up in {stale_days}+ days:\n\n{lines}\n\nWorth a check-in."
    result = send_email(user.email, subject, body)

    repo.add_log(
        rule,
        user.id,
        status="sent" if result.sent else "skipped",
        message=(f"Stale-lead alert sent ({len(stale_contacts)} leads)." if result.sent else result.reason),
    )
    repo.mark_run(rule)
    return {"ran": True, "stale_count": len(stale_contacts), "sent": result.sent}


def run_site_visit_reminders(db: Session, user: User) -> dict:
    """
    Emails the contact a reminder ahead of a scheduled site visit. How far in
    advance is configured per visit (SiteVisit.reminder_hours_before) — this
    checks the actual due window per visit, not a single fixed offset.
    """
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "site_visit_reminders")
    if rule is None or not rule.enabled:
        return {"ran": False, "reason": "Automation is disabled."}

    visit_repo = SiteVisitRepository(db)
    due_visits = visit_repo.list_due_reminders(user.id)

    sent, skipped = 0, 0
    for visit in due_visits:
        contact = db.query(Contact).filter(Contact.id == visit.contact_id).first()
        if contact is None:
            continue

        when = visit.scheduled_at.strftime("%b %d, %Y at %H:%M")
        subject = f"Reminder: site visit for {visit.property_name}"
        body = (
            f"Hi {contact.full_name.split(' ')[0]},\n\n"
            f"Just a reminder about your upcoming site visit for {visit.property_name} "
            f"on {when}.\n\n"
            f"Let me know if you need to reschedule.\n\n"
            f"Best,\n{user.full_name}"
        )
        result = send_email(contact.email or "", subject, body)

        if result.sent:
            sent += 1
            db.add(Activity(contact_id=contact.id, created_by=user.id, type="email", content=f"Automated site visit reminder sent: {subject}"))
            repo.add_log(rule, user.id, status="sent", message=f"Reminder sent to {contact.full_name} for {visit.property_name}.", contact_id=contact.id)
        else:
            skipped += 1
            repo.add_log(rule, user.id, status="skipped", message=f"{contact.full_name}: {result.reason}", contact_id=contact.id)

        visit_repo.mark_reminder_sent(visit)
        db.commit()

    repo.mark_run(rule)
    return {"ran": True, "sent": sent, "skipped": skipped, "checked": len(due_visits)}


def maybe_create_stage_task(db: Session, user: User, deal: Deal, stage_label: str) -> None:
    """Fires immediately when a deal changes pipeline stage — not part of the daily schedule."""
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "deal_stage_tasks")
    if rule is None or not rule.enabled:
        return

    followup = FollowUpRepository(db).create(
        owner_id=user.id,
        contact_id=deal.contact_id,
        deal_id=deal.id,
        due_at=_now() + timedelta(hours=24),
        note=f'Follow up: "{deal.title}" moved to {stage_label}',
    )
    repo.add_log(
        rule,
        user.id,
        status="sent",
        message=f'Task created: follow up on "{deal.title}" ({stage_label}).',
        contact_id=deal.contact_id,
    )
    repo.mark_run(rule)
    return followup


def maybe_alert_property_view(db: Session, user: User, prop: Property, contact: Contact | None) -> None:
    """Fires immediately when a lead opens a shared property link."""
    repo = AutomationRepository(db)
    rule = repo.get_by_key(user.id, "property_view_alert")
    if rule is None or not rule.enabled:
        return

    who = contact.full_name if contact else "Someone (no contact linked to this link)"
    subject = f"{who} just viewed: {prop.title}"
    body = (
        f"Hi {user.full_name},\n\n"
        f"{who} opened the shared link for \"{prop.title}\" "
        f"({prop.address or 'no address on file'}).\n\n"
        f"This could be a good moment to follow up."
    )
    result = send_email(user.email, subject, body)

    repo.add_log(
        rule,
        user.id,
        status="sent" if result.sent else "skipped",
        message=(f"Property view alert sent — {who} viewed {prop.title}." if result.sent else result.reason),
        contact_id=contact.id if contact else None,
    )
    repo.mark_run(rule)


def run_all_daily_automations_for_user(db: Session, user: User) -> dict:
    return {
        "daily_followup_reminder": run_daily_followup_reminders(db, user),
        "stale_lead_alert": run_stale_lead_alert(db, user),
        "site_visit_reminders": run_site_visit_reminders(db, user),
    }
