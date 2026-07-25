"""
Property Matching Engine
------------------------
This is deliberately a transparent, rule-based scoring system rather than a
black-box "AI" — every point awarded can be traced back to a real field on
the Contact (client preferences) and the Property (listing details). This
keeps the feature honest: a score of "82%" always means something concrete
and explainable, never a made-up number.

Scoring works as follows: for each comparable criterion (budget, city,
property type, bedrooms) where BOTH the client's preference and the
property's data are present, we award weighted points for a match (full or
partial) and record a human-readable reason. Criteria where data is missing
on either side are excluded from the denominator entirely, so a contact/
property with fewer stated preferences isn't unfairly penalised — they will
just show fewer "reasons" and fewer "missing" notes.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.database.models.contact import Contact
from app.database.models.property import Property

# (criterion name, weight out of 100)
_WEIGHTS = {
    "budget": 35,
    "city": 25,
    "property_type": 25,
    "bedrooms": 15,
}


@dataclass
class MatchResult:
    score: int
    reasons: list[str] = field(default_factory=list)
    missing: list[str] = field(default_factory=list)


def _score_budget(contact: Contact, prop: Property, result: MatchResult, possible: list[int], earned: list[float]) -> None:
    if prop.price is None:
        result.missing.append("Property has no listed price")
        return
    if contact.budget_min is None and contact.budget_max is None:
        result.missing.append("Client has no stated budget")
        return

    weight = _WEIGHTS["budget"]
    possible.append(weight)
    price = float(prop.price)
    lo = float(contact.budget_min) if contact.budget_min is not None else 0
    hi = float(contact.budget_max) if contact.budget_max is not None else float("inf")

    if lo <= price <= hi:
        earned.append(weight)
        result.reasons.append(f"Price ({price:,.0f}) is within the client's budget")
    elif hi != float("inf") and price <= hi * 1.1:
        earned.append(weight * 0.5)
        result.reasons.append(f"Price ({price:,.0f}) is only slightly above the client's max budget")
    else:
        result.missing.append(f"Price ({price:,.0f}) is outside the client's stated budget")


def _score_city(contact: Contact, prop: Property, result: MatchResult, possible: list[int], earned: list[float]) -> None:
    if not prop.city or not contact.preferred_city:
        if not prop.city:
            result.missing.append("Property has no listed city")
        if not contact.preferred_city:
            result.missing.append("Client has no preferred city on file")
        return

    weight = _WEIGHTS["city"]
    possible.append(weight)
    if prop.city.strip().lower() == contact.preferred_city.strip().lower():
        earned.append(weight)
        result.reasons.append(f"Located in the client's preferred city ({prop.city})")
    else:
        result.missing.append(f"City ({prop.city}) doesn't match the client's preference ({contact.preferred_city})")


def _score_type(contact: Contact, prop: Property, result: MatchResult, possible: list[int], earned: list[float]) -> None:
    if not prop.property_type or not contact.preferred_property_type:
        if not contact.preferred_property_type:
            result.missing.append("Client has no preferred property type on file")
        return

    weight = _WEIGHTS["property_type"]
    possible.append(weight)
    if prop.property_type == contact.preferred_property_type:
        earned.append(weight)
        result.reasons.append(f"Property type matches the client's preference ({prop.property_type})")
    else:
        result.missing.append(f"Property type ({prop.property_type}) differs from preference ({contact.preferred_property_type})")


def _score_bedrooms(contact: Contact, prop: Property, result: MatchResult, possible: list[int], earned: list[float]) -> None:
    if prop.bedrooms is None or contact.preferred_bedrooms is None:
        if contact.preferred_bedrooms is None:
            result.missing.append("Client has no preferred bedroom count on file")
        return

    weight = _WEIGHTS["bedrooms"]
    possible.append(weight)
    if prop.bedrooms == contact.preferred_bedrooms:
        earned.append(weight)
        result.reasons.append(f"Has the client's preferred number of bedrooms ({prop.bedrooms})")
    elif prop.bedrooms >= contact.preferred_bedrooms:
        earned.append(weight * 0.6)
        result.reasons.append(f"Has more bedrooms ({prop.bedrooms}) than the client asked for ({contact.preferred_bedrooms})")
    else:
        result.missing.append(f"Has fewer bedrooms ({prop.bedrooms}) than the client wants ({contact.preferred_bedrooms})")


def score_property_for_contact(contact: Contact, prop: Property) -> MatchResult:
    result = MatchResult(score=0)
    possible: list[int] = []
    earned: list[float] = []

    _score_budget(contact, prop, result, possible, earned)
    _score_city(contact, prop, result, possible, earned)
    _score_type(contact, prop, result, possible, earned)
    _score_bedrooms(contact, prop, result, possible, earned)

    total_possible = sum(possible)
    total_earned = sum(earned)
    result.score = round((total_earned / total_possible) * 100) if total_possible > 0 else 0
    return result


def match_properties_for_contact(contact: Contact, properties: list[Property]):
    from app.schemas.property import PropertyMatchResult, PropertyResponse

    scored = []
    for prop in properties:
        result = score_property_for_contact(contact, prop)
        scored.append(
            PropertyMatchResult(
                score=result.score,
                reasons=result.reasons,
                missing=result.missing,
                property=PropertyResponse.model_validate(prop),
            )
        )
    scored.sort(key=lambda r: r.score, reverse=True)
    return scored


def match_contacts_for_property(prop: Property, contacts: list[Contact]):
    from app.schemas.contact import ContactResponse

    scored = []
    for contact in contacts:
        result = score_property_for_contact(contact, prop)
        scored.append(
            {
                "score": result.score,
                "reasons": result.reasons,
                "missing": result.missing,
                "contact": ContactResponse.model_validate(contact),
            }
        )
    scored.sort(key=lambda r: r["score"], reverse=True)
    return scored
