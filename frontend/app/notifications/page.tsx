"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface FollowUp {
  id: string;
  contact_id: string;
  due_at: string;
  note: string | null;
  is_done: boolean;
}

interface Contact {
  id: string;
  full_name: string;
}

export default function NotificationsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listFollowups(true), api.listContacts()])
      .then(([f, c]) => {
        setFollowups(f as FollowUp[]);
        setContacts(c as Contact[]);
      })
      .finally(() => setLoading(false));
  }, []);

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.full_name || "Unknown contact";
  }

  const now = new Date();
  const overdue = followups
    .filter((f) => new Date(f.due_at) < now)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  const upcoming = followups
    .filter((f) => new Date(f.due_at) >= now)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Based on your real follow-up tasks — no separate notifications system yet.</p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && overdue.length === 0 && upcoming.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No notifications right now. You're all caught up.
        </div>
      )}

      {overdue.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-red-600">Overdue ({overdue.length})</h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            {overdue.map((f) => (
              <Link
                key={f.id}
                href="/followups"
                className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{contactName(f.contact_id)}</p>
                  <p className="text-xs text-gray-400">{f.note || "Follow-up"}</p>
                </div>
                <span className="text-xs font-semibold text-red-500">
                  Due {new Date(f.due_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Upcoming</h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            {upcoming.map((f) => (
              <Link
                key={f.id}
                href="/followups"
                className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{contactName(f.contact_id)}</p>
                  <p className="text-xs text-gray-400">{f.note || "Follow-up"}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(f.due_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
