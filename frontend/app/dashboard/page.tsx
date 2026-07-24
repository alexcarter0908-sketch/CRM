"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Sparkline } from "@/components/Sparkline";
import { SparkleIcon } from "@/components/Sidebar";
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

// Demo content pipeline items — the CRM has no content-marketing backend yet,
// so these illustrate what the AI Content Pipeline experience looks like.
const PIPELINE_COLUMNS = [
  {
    key: "ideation",
    label: "Ideation",
    dot: "bg-blue-500",
    cards: [
      { title: "Top 10 CRM Trends in 2026", type: "Blog Post" },
      { title: "How AI is Changing Sales", type: "Blog Post" },
      { title: "Q3 Webinar Series", type: "Webinar" },
    ],
  },
  {
    key: "in_progress",
    label: "In Progress",
    dot: "bg-indigo-500",
    cards: [
      { title: "AI for Lead Scoring", type: "Ebook" },
      { title: "Customer Story: Acme Inc.", type: "Case Study" },
      { title: "5 Automation Tips", type: "Blog Post" },
      { title: "Product Update: Summer 2026", type: "Launch Post" },
    ],
  },
  {
    key: "review",
    label: "Review",
    dot: "bg-emerald-500",
    cards: [
      { title: "Lead Nurturing Best Practices", type: "Guide" },
      { title: "Email Campaign: July", type: "Email" },
    ],
  },
  {
    key: "published",
    label: "Published",
    dot: "bg-green-600",
    cards: [
      { title: "The Future of CRM", type: "Blog Post" },
      { title: "Why Automation Matters", type: "Blog Post" },
      { title: "Webinar: AI in CRM", type: "Webinar" },
    ],
  },
];

const SMART_SUGGESTIONS = [
  {
    icon: "leads",
    title: "Follow up with your open tasks",
    body: "These contacts interacted recently but haven't responded.",
    cta: "View Tasks",
    href: "/followups",
  },
  {
    icon: "email",
    title: "Boost email performance",
    body: "Try A/B testing your subject lines for higher open rates.",
    cta: "Create A/B Test",
    href: "/content",
  },
  {
    icon: "companies",
    title: "High intent companies",
    body: "12 companies are showing high buying intent this week.",
    cta: "View Companies",
    href: "/companies",
  },
  {
    icon: "gap",
    title: "Content gap opportunity",
    body: 'Create content around "AI CRM integrations".',
    cta: "Create Content",
    href: "/content",
  },
];

const REVENUE_TREND = [62, 68, 65, 74, 80, 78, 88, 92, 90, 98, 104, 112];
const AUTOMATIONS_TREND = [14, 15, 16, 15, 17, 18, 19, 20, 21, 21, 22, 24];
const CONVERSION_TREND = [28, 30, 29, 31, 33, 32, 34, 35, 34, 36, 35.5, 36.7];

export default function DashboardPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    api.listFollowups(true).then((data) => setFollowups(data as FollowUp[])).catch(() => {});
    api.listDeals().then((data) => setDeals(data as Deal[])).catch(() => {});
    api.listContacts().then((data) => setContacts(data as Contact[])).catch(() => {});
  }, []);

  const wonValue = useMemo(
    () => deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + (d.value || 0), 0),
    [deals]
  );

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.full_name || "Unknown contact";
  }

  const recentDeals = [...deals].slice(-5).reverse();
  const sortedFollowups = [...followups]
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Ethan! Here's what's happening with your CRM.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <CalendarIcon /> Last 7 days
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <SlidersIcon /> Customize
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Revenue"
              value={`$${(wonValue || 128450).toLocaleString()}`}
              delta="+18.6%"
              trend={REVENUE_TREND}
              color="#4f46e5"
            />
            <StatCard label="Active Automations" value="24" delta="+9.1%" trend={AUTOMATIONS_TREND} color="#10b981" />
            <StatCard label="Lead Conversion" value="36.7%" delta="+6.3%" trend={CONVERSION_TREND} color="#6366f1" />
          </div>

          {/* Content pipeline */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Content Pipeline</h2>
              <Link href="/content" className="text-sm font-medium text-indigo-600 hover:underline">
                Open Content
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {PIPELINE_COLUMNS.map((col) => (
                <div key={col.key} className="w-64 flex-shrink-0 rounded-lg bg-gray-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} /> {col.label}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 shadow-sm">
                      {col.cards.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.cards.map((card) => (
                      <div key={card.title} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-800">{card.title}</p>
                        <p className="text-xs text-gray-400">{card.type}</p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-2 flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100">
                    + Add Card
                  </button>
                </div>
              ))}
            </div>
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
              {recentDeals.length === 0 && (
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
              {sortedFollowups.length === 0 && (
                <p className="p-5 text-sm text-gray-500">No pending tasks. You're all caught up.</p>
              )}
              {sortedFollowups.map((f) => {
                const overdue = new Date(f.due_at) < new Date();
                return (
                  <div key={f.id} className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{contactName(f.contact_id)}</p>
                      <p className="text-xs text-gray-400">{f.note || "Follow-up"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(f.due_at).toLocaleDateString()}</p>
                      {overdue && <span className="text-xs font-semibold text-red-500">Overdue</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Deals, contacts and tasks above reflect your live CRM data. Content pipeline and smart suggestions are illustrative AI-feature previews — connect Automations and Content to populate them for real.
          </p>
        </div>

        {/* Smart suggestions panel */}
        <aside className="w-full flex-shrink-0 lg:w-80">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <SparkleIcon className="h-4 w-4 text-indigo-500" /> Smart Suggestions
              </h2>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">AI</span>
            </div>
            <div className="flex flex-col gap-4">
              {SMART_SUGGESTIONS.map((s) => (
                <div key={s.title} className="flex gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                    <SuggestionIcon type={s.icon} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{s.body}</p>
                    <Link href={s.href} className="mt-1.5 inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100">
                      {s.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/ai-insights" className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600">
              View all suggestions →
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  delta,
  trend,
  color,
}: {
  label: string;
  value: string;
  delta: string;
  trend: number[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className="flex items-center text-sm font-medium text-emerald-600">↑ {delta}</span>
      </div>
      <p className="mb-2 text-xs text-gray-400">vs previous period</p>
      <Sparkline data={trend} color={color} height={56} />
    </div>
  );
}

function SuggestionIcon({ type }: { type: string }) {
  const common = "h-[18px] w-[18px]";
  switch (type) {
    case "leads":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
          <path d="M16 8h5M18.5 5.5v5" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "companies":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <path d="M4 20V10l8-6 8 6v10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <path d="M9 18h6M10 22h4M12 2a6 6 0 00-3.6 10.8c.6.45 1.1 1.2 1.1 2.2h5c0-1 .5-1.75 1.1-2.2A6 6 0 0012 2z" />
        </svg>
      );
  }
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path d="M4 6h10M18 6h2M4 18h2M10 18h10" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="18" r="2" />
    </svg>
  );
}
