"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface FollowUp {
  id: string;
  contact_id: string;
  deal_id: string | null;
  due_at: string;
  note: string | null;
  is_done: boolean;
}

interface Contact {
  id: string;
  full_name: string;
}

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDue, setEditDue] = useState("");
  const [editNote, setEditNote] = useState("");

  function load() {
    api.listFollowups(showPendingOnly).then((data) => setFollowups(data as FollowUp[]));
    api.listContacts().then((data) => setContacts(data as Contact[]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPendingOnly]);

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.full_name || "Unknown";
  }

  async function toggleDone(f: FollowUp) {
    await api.updateFollowup(f.id, { is_done: !f.is_done });
    load();
  }

  function startEdit(f: FollowUp) {
    setEditingId(f.id);
    // to local datetime-local format
    const d = new Date(f.due_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    setEditDue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setEditNote(f.note || "");
  }

  async function saveEdit(id: string) {
    await api.updateFollowup(id, {
      due_at: new Date(editDue).toISOString(),
      note: editNote || null,
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this follow-up?")) return;
    await api.deleteFollowup(id);
    load();
  }

  const sorted = [...followups].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  return (
    <AppShell maxWidth="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Follow-ups</h1>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
            />
            Show pending only
          </label>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {sorted.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">No follow-ups found.</p>
          )}
          {sorted.map((f) => {
            const overdue = !f.is_done && new Date(f.due_at) < new Date();
            return (
              <div key={f.id} className="border-b border-gray-100 p-4 last:border-0">
                {editingId === f.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="datetime-local"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                    />
                    <input
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Note"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(f.id)}
                        className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={f.is_done}
                        onChange={() => toggleDone(f)}
                        className="mt-1"
                      />
                      <div>
                        <Link href={`/contacts/${f.contact_id}`} className="font-medium text-brand hover:underline">
                          {contactName(f.contact_id)}
                        </Link>
                        <p className={`text-sm ${overdue ? "font-semibold text-red-500" : "text-gray-500"}`}>
                          {new Date(f.due_at).toLocaleString()} {overdue && "• Overdue"}
                        </p>
                        {f.note && <p className="mt-1 text-sm text-gray-700">{f.note}</p>}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-3 text-xs">
                      <button onClick={() => startEdit(f)} className="text-gray-500 hover:text-gray-800 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-red-700 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
    </AppShell>
  );
}
