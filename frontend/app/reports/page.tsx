"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface MonthlyStat {
  month: string;
  won_count: number;
  won_value: number;
  created_count: number;
}

interface SalesPerformance {
  months: MonthlyStat[];
  note: string;
}

interface LeadSource {
  source: string;
  contact_count: number;
  won_value: number;
  won_count: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export default function ReportsPage() {
  const [sales, setSales] = useState<SalesPerformance | null>(null);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSalesPerformance(), api.getLeadSources(), api.getConversionFunnel()])
      .then(([s, src, f]) => {
        setSales(s as SalesPerformance);
        setSources(src as LeadSource[]);
        setFunnel(f as FunnelStage[]);
      })
      .finally(() => setLoading(false));
  }, []);

  function handlePrint() {
    window.print();
  }

  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));
  const maxMonthlyValue = Math.max(1, ...(sales?.months.map((m) => m.won_value) || [0]));

  return (
    <AppShell maxWidth="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            Automated reports generated live from your real deals and contacts — no sample data.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Print / Export PDF
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {/* Sales performance */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Sales Performance by Month</h2>
        {sales && <p className="mb-4 text-xs text-gray-400">{sales.note}</p>}

        {sales && sales.months.length === 0 && (
          <p className="text-sm text-gray-500">No deals recorded yet.</p>
        )}

        {sales && sales.months.length > 0 && (
          <div className="flex flex-col gap-3">
            {sales.months.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-20 flex-shrink-0 text-sm text-gray-500">{m.month}</span>
                <div className="h-3 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-indigo-500"
                    style={{ width: `${(m.won_value / maxMonthlyValue) * 100}%` }}
                  />
                </div>
                <span className="w-32 flex-shrink-0 text-right text-sm font-medium text-gray-700">
                  ${m.won_value.toLocaleString()} ({m.won_count})
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lead sources */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Lead Sources</h2>
        {sources.length === 0 && <p className="text-sm text-gray-500">No contacts recorded yet.</p>}
        {sources.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Contacts</th>
                  <th className="px-4 py-2">Won Deals</th>
                  <th className="px-4 py-2">Won Value</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.source} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-800">{s.source}</td>
                    <td className="px-4 py-2 text-gray-600">{s.contact_count}</td>
                    <td className="px-4 py-2 text-gray-600">{s.won_count}</td>
                    <td className="px-4 py-2 text-gray-600">${s.won_value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Conversion funnel */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Conversion Funnel</h2>
        <div className="flex flex-col gap-3">
          {funnel.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <span className="w-24 flex-shrink-0 text-sm text-gray-500">{STAGE_LABELS[f.stage] || f.stage}</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(f.count / maxFunnel) * 100}%` }} />
              </div>
              <span className="w-10 flex-shrink-0 text-right text-sm font-medium text-gray-700">{f.count}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
