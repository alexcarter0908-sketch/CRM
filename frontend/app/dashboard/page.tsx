"use client";

import { useEffect, useMemo, useState } from "react";
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

interface Deal {
  id: string;
  contact_id: string;
  title: string;
  value: number | null;
  stage: string;
}

interface Contact {
  id: string;
  full_name: string;
}

export default function DashboardPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listFollowups(true).catch(() => []),
      api.listDeals().catch(() => []),
      api.listContacts().catch(() => []),
    ])
      .then(([f, d, c]) => {
        setFollowups(f as FollowUp[]);
        setDeals(d as Deal[]);
        setContacts(c as Contact[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + (d.value || 0), 0);
  const openValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  const now = new Date();
  const overdue = followups.filter((f) => new Date(f.due_at) < now);

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.full_name || "Unknown contact";
  }

  const recentDeals = [...deals].slice(-5).reverse();
  const sortedFollowups = [...followups]
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  // Genuine suggestions computed from real data — no invented numbers.
  const suggestions = useMemo(() => {
    const list: { title: string; body: string; cta: string; href: string }[] = [];
    if (overdue.length > 0) {
      list.push({
        title: `${overdue.length} overdue task${overdue.length !== 1 ? "s" : ""}`,
        body: "These follow-ups are past their due date.",
        cta: "View Tasks",
        href: "/followups",
      });
    }
    const proposalDeals = deals.filter((d) => d.stage === "proposal" || d.stage === "negotiation");
    if (proposalDeals.length > 0) {
      list.push({
        title: `${proposalDeals.length} deal${proposalDeals.length !== 1 ? "s" : ""} in late stage`,
        body: "These deals are in proposal or negotiation — worth a check-in.",
        cta: "View Deals",
        href: "/pipeline",
      });
    }
    if (contacts.length === 0) {
      list.push({
        title: "Add your first contact",
        body: "Your CRM is empty — add a contact to get started.",
        cta: "Add Contact",
        href: "/contacts",
      });
    }
    return list;
  }, [overdue, deals, contacts]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">A live snapshot of your contacts, deals and tasks.</p>
          </div>

          {loading && <p className="mb-6 text-sm text-gray-500">Loading your data…</p>}

          {/* Stat cards — all computed from real data, no invented trends */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard label="Total Contacts" value={contacts.length.toString()} />
            <StatCard label="Open Deals" value={`${openDeals.length} · $${openValue.toLocaleString()}`} />
            <StatCard label="Won Value" value={`$${wonValue.toLocaleString()}`} />
            <StatCard label="Pending Tasks" value={followups.length.toString()} highlight={overdue.length > 0} />
          </div>

          {/* Recent deals + tasks */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h2 className="font-semibold text-gray-900">Recent Deals</h2>
                <Link href="/pipeline" className="text-sm text-indigo-600 hover:underline">
                  View All
                </Link>
              </div>
              {!loading && recentDeals.length === 0 && (
                <p className="p-5 text-sm text-gray-500">No deals yet — add one from the Deals page.</p>
              )}
              {recentDeals.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{contactName(d.contact_id)}</p>
                    <p className="text-xs text-gray-400">{d.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.value !== null && <span className="text-sm font-semibold text-gray-700">${d.value.toLocaleString()}</span>}
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium capitalize text-indigo-600">
                      {d.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h2 className="font-semibold text-gray-900">Tasks</h2>
                <Link href="/followups" className="text-sm text-indigo-600 hover:underline">
                  View All
                </Link>
              </div>
              {!loading && sortedFollowups.length === 0 && (
                <p className="p-5 text-sm text-gray-500">No pending tasks. You're all caught up.</p>
              )}
              {sortedFollowups.map((f) => {
                const isOverdue = new Date(f.due_at) < now;
                return (
                  <div key={f.id} className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{contactName(f.contact_id)}</p>
                      <p className="text-xs text-gray-400">{f.note || "Follow-up"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(f.due_at).toLocaleDateString()}</p>
                      {isOverdue && <span className="text-xs font-semibold text-red-500">Overdue</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suggestions panel — only real, data-derived suggestions */}
        <aside className="w-full flex-shrink-0 lg:w-80">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Suggestions</h2>
            {suggestions.length === 0 && (
              <p className="text-sm text-gray-500">Nothing needs your attention right now.</p>
            )}
            <div className="flex flex-col gap-4">
              {suggestions.map((s) => (
                <div key={s.title} className="rounded-lg border border-gray-100 p-3">
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{s.body}</p>
                  <Link
                    href={s.href}
                    className="mt-2 inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                  >
                    {s.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
            <p className="mb-1 font-semibold text-gray-700">Content Pipeline & Automations</p>
            <p>Not connected yet — these will show real data once that feature is built out.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
