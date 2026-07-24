"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  category: "Email" | "Lead Scoring" | "Tasks" | "Content";
  runsThisWeek: number;
  enabled: boolean;
}

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "a1",
    name: "Welcome email sequence",
    description: "Sends a 3-part welcome series when a new contact is added.",
    trigger: "Contact created",
    category: "Email",
    runsThisWeek: 18,
    enabled: true,
  },
  {
    id: "a2",
    name: "Lead scoring refresh",
    description: "Recalculates lead scores nightly based on recent activity.",
    trigger: "Scheduled â€” daily at 2:00 AM",
    category: "Lead Scoring",
    runsThisWeek: 7,
    enabled: true,
  },
  {
    id: "a3",
    name: "Stale deal reminder",
    description: "Creates a follow-up task when a deal has no activity for 7 days.",
    trigger: "Deal inactive 7 days",
    category: "Tasks",
    runsThisWeek: 12,
    enabled: true,
  },
  {
    id: "a4",
    name: "Proposal follow-up",
    description: "Reminds the deal owner 2 days after a proposal is sent.",
    trigger: "Deal stage â†’ Proposal",
    category: "Tasks",
    runsThisWeek: 9,
    enabled: false,
  },
  {
    id: "a5",
    name: "Content gap alert",
    description: "Flags topics with high search interest but no published content.",
    trigger: "Weekly content review",
    category: "Content",
    runsThisWeek: 1,
    enabled: true,
  },
  {
    id: "a6",
    name: "Re-engagement email",
    description: "Emails contacts who haven't opened a message in 30 days.",
    trigger: "No opens in 30 days",
    category: "Email",
    runsThisWeek: 24,
    enabled: false,
  },
];

const CATEGORY_COLORS: Record<Automation["category"], string> = {
  Email: "bg-blue-50 text-blue-600",
  "Lead Scoring": "bg-purple-50 text-purple-600",
  Tasks: "bg-amber-50 text-amber-600",
  Content: "bg-emerald-50 text-emerald-600",
};

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);

  function toggle(id: string) {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }

  const activeCount = automations.filter((a) => a.enabled).length;
  const totalRuns = automations.reduce((sum, a) => sum + (a.enabled ? a.runsThisWeek : 0), 0);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          
<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            Automations
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Preview - not yet functional
            </span>
          </h1>
          <p className="text-sm text-gray-500">Set up, manage, and monitor your AI-driven automations.</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + New Automation
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Automations</p>
          <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Runs this week</p>
          <p className="text-3xl font-bold text-gray-900">{totalRuns}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Estimated time saved</p>
          <p className="text-3xl font-bold text-gray-900">24.6h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {automations.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-semibold text-gray-900">{a.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[a.category]}`}>
                  {a.category}
                </span>
              </div>
              <p className="text-sm text-gray-500">{a.description}</p>
              <p className="mt-2 text-xs text-gray-400">Trigger: {a.trigger}</p>
              <p className="text-xs text-gray-400">{a.runsThisWeek} runs this week</p>
            </div>
            <button
              onClick={() => toggle(a.id)}
              aria-pressed={a.enabled}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${a.enabled ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  a.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        This is a demo automation workspace â€” toggles are stored locally in your browser session, not on a server yet.
      </p>
    </AppShell>
  );
}


