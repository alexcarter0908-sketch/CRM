"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_property_type: string | null;
  preferred_city: string | null;
  preferred_bedrooms: number | null;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface PropertyMatch {
  score: number;
  reasons: string[];
  missing: string[];
  property: { id: string; title: string; price: number | null; city: string | null };
}

const PROPERTY_TYPES = ["", "house", "apartment", "plot", "commercial"];

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [note, setNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [followupDue, setFollowupDue] = useState("");
  const [followupNote, setFollowupNote] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    notes: "",
    budget_min: "",
    budget_max: "",
    preferred_property_type: "",
    preferred_city: "",
    preferred_bedrooms: "",
  });

  function load() {
    api.getContact(contactId).then((data) => {
      const c = data as Contact;
      setContact(c);
      setForm({
        full_name: c.full_name,
        email: c.email || "",
        phone: c.phone || "",
        company: c.company || "",
        source: c.source || "",
        notes: c.notes || "",
        budget_min: c.budget_min?.toString() || "",
        budget_max: c.budget_max?.toString() || "",
        preferred_property_type: c.preferred_property_type || "",
        preferred_city: c.preferred_city || "",
        preferred_bedrooms: c.preferred_bedrooms?.toString() || "",
      });
    });
    api.listActivities(contactId).then((data) => setActivities(data as Activity[]));
    api.getPropertyMatchesForContact(contactId).then((data) => setMatches(data as PropertyMatch[]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    await api.updateContact(contactId, {
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      source: form.source || null,
      notes: form.notes || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      preferred_property_type: form.preferred_property_type || null,
      preferred_city: form.preferred_city || null,
      preferred_bedrooms: form.preferred_bedrooms ? Number(form.preferred_bedrooms) : null,
    });
    setIsEditing(false);
    load();
  }

  async function handleDeleteContact() {
    if (!contact) return;
    if (!confirm(`Delete "${contact.full_name}"? This cannot be undone.`)) return;
    await api.deleteContact(contactId);
    router.push("/contacts");
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await api.createActivity({ contact_id: contactId, type: activityType, content: note });
    setNote("");
    load();
  }

  async function handleAddFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!followupDue) return;
    await api.createFollowup({
      contact_id: contactId,
      due_at: new Date(followupDue).toISOString(),
      note: followupNote || null,
    });
    setFollowupDue("");
    setFollowupNote("");
  }

  if (!contact) {
    return (
      <AppShell maxWidth="max-w-3xl">
        <p className="text-sm text-gray-500">Loading…</p>
      </AppShell>
    );
  }

  const hasPreferences =
    contact.budget_min || contact.budget_max || contact.preferred_property_type || contact.preferred_city || contact.preferred_bedrooms;

  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">{contact.full_name}</h1>
          <p className="text-sm text-gray-500">
            {contact.email || "No email"} • {contact.phone || "No phone"} • {contact.company || "No company"}
          </p>
          {contact.source && <p className="mt-1 text-xs text-gray-400">Source: {contact.source}</p>}
          {contact.notes && <p className="mt-1 text-sm text-gray-500">{contact.notes}</p>}
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDeleteContact}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2"
        >
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Lead source (e.g. Facebook Ads)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <textarea
            className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <p className="text-sm font-semibold text-gray-700 sm:col-span-2">Property Preferences (for matching)</p>
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Budget min" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Budget max" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
          <select className="rounded-lg border border-gray-300 px-3 py-2" value={form.preferred_property_type} onChange={(e) => setForm({ ...form, preferred_property_type: e.target.value })}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t ? t[0].toUpperCase() + t.slice(1) : "Any type"}</option>
            ))}
          </select>
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Preferred city" value={form.preferred_city} onChange={(e) => setForm({ ...form, preferred_city: e.target.value })} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Preferred bedrooms" value={form.preferred_bedrooms} onChange={(e) => setForm({ ...form, preferred_bedrooms: e.target.value })} />

          <button type="submit" className="col-span-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
            Save Changes
          </button>
        </form>
      )}

      {hasPreferences && !isEditing && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          <p className="mb-1 font-semibold text-gray-800">Property Preferences</p>
          <p className="text-gray-500">
            {contact.budget_min || contact.budget_max
              ? `Budget: ${contact.budget_min?.toLocaleString() || "0"} - ${contact.budget_max?.toLocaleString() || "any"}`
              : "Budget: not specified"}
            {" · "}
            {contact.preferred_property_type ? `Type: ${contact.preferred_property_type}` : "Type: any"}
            {" · "}
            {contact.preferred_city ? `City: ${contact.preferred_city}` : "City: any"}
            {" · "}
            {contact.preferred_bedrooms ? `${contact.preferred_bedrooms} bedrooms` : "Bedrooms: any"}
          </p>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-900">Matched Properties</h2>
        <p className="mb-4 text-xs text-gray-500">
          Real, rule-based matches from your Properties list — scored against this client's preferences above.
        </p>
        {matches.length === 0 && (
          <p className="text-sm text-gray-500">
            No matches yet. Add property preferences above, or add matching listings under Properties.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {matches.map((m) => (
            <Link
              key={m.property.id}
              href={`/properties/${m.property.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:border-indigo-200"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{m.property.title}</p>
                <p className="text-xs text-gray-400">
                  {m.property.city || "—"} {m.property.price !== null ? `· $${m.property.price.toLocaleString()}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  m.score >= 70 ? "bg-emerald-50 text-emerald-600" : m.score >= 40 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                {m.score}%
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold">Add Follow-up</h2>
          <form onSubmit={handleAddFollowup} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="datetime-local"
              className="rounded-lg border border-gray-300 px-3 py-2"
              value={followupDue}
              onChange={(e) => setFollowupDue(e.target.value)}
              required
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Note (optional)"
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
            />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark">
              Schedule
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Log Activity</h2>
          <form onSubmit={handleAddActivity} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            >
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
            <textarea
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark">
              Add
            </button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 font-semibold">Activity Timeline</h2>
      <div className="rounded-xl border border-gray-200 bg-white">
        {activities.length === 0 && (
          <p className="p-5 text-sm text-gray-500">No activity yet.</p>
        )}
        {activities.map((a) => (
          <div key={a.id} className="border-b border-gray-100 p-4 last:border-0">
            <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-500">
              {a.type}
            </span>
            <span className="text-sm text-gray-700">{a.content}</span>
            <p className="mt-1 text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
