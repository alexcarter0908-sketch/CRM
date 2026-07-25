"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface LeadScore {
  contact_id: string;
  full_name: string;
  score: number;
  breakdown: string[];
}

export default function AIInsightsPage() {
  const [scores, setScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api
      .getLeadScores()
      .then((data) => setScores(data as LeadScore[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics — Lead Scores</h1>
        <p className="text-sm text-gray-500">
          A real, rule-based score (0–100) for every contact, computed from their actual deals, logged
          activities, and follow-up history. No external AI, no invented numbers — click a contact to see
          exactly how their score was calculated.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && scores.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No contacts yet — add some contacts, deals and activities to generate lead scores.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {scores.map((s) => (
          <div key={s.contact_id} className="rounded-xl border border-gray-200 bg-white p-4">
            <button
              onClick={() => setExpanded(expanded === s.contact_id ? null : s.contact_id)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <Link
                  href={`/contacts/${s.contact_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {s.full_name}
                </Link>
                <div className="mt-1 h-1.5 w-40 rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${
                      s.score >= 70 ? "bg-emerald-500" : s.score >= 40 ? "bg-amber-500" : "bg-gray-300"
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  s.score >= 70
                    ? "bg-emerald-50 text-emerald-600"
                    : s.score >= 40
                    ? "bg-amber-50 text-amber-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {s.score}
              </span>
            </button>
            {expanded === s.contact_id && (
              <ul className="mt-3 list-inside list-disc border-t border-gray-100 pt-3 text-xs text-gray-500">
                {s.breakdown.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
