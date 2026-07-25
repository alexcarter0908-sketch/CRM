"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Deal {
  id: string;
  value: number | null;
  stage: string;
}

const STAGES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listDeals()
      .then((data) => setDeals(data as Deal[]))
      .finally(() => setLoading(false));
  }, []);

  const stageBreakdown = useMemo(() => {
    const counts = STAGES.map((stage) => ({
      stage,
      count: deals.filter((d) => d.stage === stage).length,
    }));
    const max = Math.max(1, ...counts.map((c) => c.count));
    return { counts, max };
  }, [deals]);

  const totalPipelineValue = deals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + (d.value || 0), 0);
  const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + (d.value || 0), 0);
  const winRate = deals.length ? Math.round((deals.filter((d) => d.stage === "won").length / deals.length) * 100) : 0;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">A snapshot of your real deal pipeline.</p>
      </div>

      {loading && <p className="mb-6 text-sm text-gray-500">Loading…</p>}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Open Pipeline Value</p>
          <p className="text-3xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Won Value</p>
          <p className="text-3xl font-bold text-gray-900">${wonValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Win Rate</p>
          <p className="text-3xl font-bold text-gray-900">{winRate}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-gray-900">Deals by Stage</p>
        <div className="flex flex-col gap-3">
          {stageBreakdown.counts.map((c) => (
            <div key={c.stage} className="flex items-center gap-3">
              <span className="w-24 flex-shrink-0 text-sm text-gray-500">{STAGE_LABELS[c.stage]}</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${(c.count / stageBreakdown.max) * 100}%` }}
                />
              </div>
              <span className="w-10 flex-shrink-0 text-right text-sm font-medium text-gray-700">{c.count}</span>
            </div>
          ))}
          {!loading && deals.length === 0 && <p className="text-sm text-gray-500">No deals yet — add one from the Deals page.</p>}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
        Website traffic and lead-source analytics aren't connected yet — they'll appear here once that
        integration is built.
      </div>
    </AppShell>
  );
}
