"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface FollowUp {
  id: string;
  due_at: string;
  note: string | null;
  is_done: boolean;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [note, setNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [followupDue, setFollowupDue] = useState("");
  const [followupNote, setFollowupNote] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editNotes, setEditNotes] = useState("");

  function load() {
    api.getContact(contactId).then((data) => {
      const c = data as Contact;
      setContact(c);
      setEditName(c.full_name);
      setEditEmail(c.email || "");
      setEditPhone(c.phone || "");
      setEditCompany(c.company || "");
      setEditNotes(c.notes || "");
    });
    api.listActivities(contactId).then((data) => setActivities(data as Activity[]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    await api.updateContact(contactId, {
      full_name: editName,
      email: editEmail || null,
      phone: editPhone || null,
      company: editCompany || null,
      notes: editNotes || null,
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

  return (
    <AppShell maxWidth="max-w-3xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold">{contact.full_name}</h1>
            <p className="text-sm text-gray-500">
              {contact.email || "No email"} • {contact.phone || "No phone"} • {contact.company || "No company"}
            </p>
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
            <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Company" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
            <textarea
              className="col-span-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <button type="submit" className="col-span-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
              Save Changes
            </button>
          </form>
        )}

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
