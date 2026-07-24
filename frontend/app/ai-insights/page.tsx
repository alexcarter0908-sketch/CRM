"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Sparkline, MultiLineChart } from "@/components/Sparkline";

const LABELS = ["Jul 17", "Jul 18", "Jul 19", "Jul 20", "Jul 21", "Jul 22", "Jul 23"];

const IMPRESSIONS = [420000, 468000, 512000, 610000, 582000, 690000, 745000];
const ENGAGEMENT = [180000, 210000, 230000, 300000, 280000, 340000, 365000];
const CONVERSIONS = [60000, 70000, 82000, 100000, 95000, 118000, 128000];

const RECENT_ACTIVITY = [
  {
    title: "AI Email Follow-up",
    status: "Completed",
    detail: 'Sent to 230 leads in "AI Content Campaign"',
    time: "2 min ago",
    icon: "email",
  },
  {
    title: "Lead Scoring Updated",
    status: "Completed",
    detail: "125 leads scored and prioritized",
    time: "15 min ago",
    icon: "leads",
  },
  {
    title: "Workflow Automation",
    status: "Completed",
    detail: "Lead nurturing workflow executed",
    time: "1 hr ago",
    icon: "automation",
  },
  {
    title: "Campaign Performance Report",
    status: "Generated",
    detail: 'Weekly report for "Product Launch"',
    time: "2 hrs ago",
    icon: "report",
  },
  {
    title: "Audience Segmentation",
    status: "Completed",
    detail: 'New segment "High Engagement Leads"',
    time: "3 hrs ago",
    icon: "segment",
  },
  {
    title: "AI Content Suggestion",
    status: "Suggested",
    detail: "5 new content ideas generated",
    time: "4 hrs ago",
    icon: "idea",
  },
  {
    title: "Data Sync",
    status: "Completed",
    detail: "Synced with 3 data sources",
    time: "5 hrs ago",
    icon: "sync",
  },
];

const STATUS_COLORS: Record<string, string> = {
  Completed: "text-emerald-400 bg-emerald-500/10",
  Generated: "text-blue-400 bg-blue-500/10",
  Suggested: "text-purple-400 bg-purple-500/10",
};

export default function AIInsightsPage() {
  const [highlight] = useState(4);

  return (
    <AppShell dark maxWidth="max-w-[1600px]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500">
                <BrainIcon />
              </span>
              AI Insights
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">Preview - sample data</span>
            </h1>
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
              Jul 17 â€“ Jul 23, 2026
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold text-white">Content Performance Overview</h2>
            <p className="mb-5 text-sm text-slate-400">AI analysis of your content across all campaigns</p>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InsightStat label="Total Impressions" value="1.42M" delta="+18.6%" icon="eye" trend={IMPRESSIONS} color="#38bdf8" />
              <InsightStat label="Engagement Rate" value="7.52%" delta="+12.4%" icon="engage" trend={ENGAGEMENT} color="#a78bfa" />
              <InsightStat label="Clicks" value="84.7K" delta="+23.1%" icon="click" trend={ENGAGEMENT.map((v) => v * 0.3)} color="#60a5fa" />
              <InsightStat label="Conversions" value="3.89K" delta="+28.7%" icon="target" trend={CONVERSIONS} color="#22d3ee" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <div className="mb-2 flex flex-wrap items-center gap-4">
                <h3 className="text-sm font-semibold text-white">Performance Trend</h3>
                <Legend color="#60a5fa" label="Impressions" />
                <Legend color="#a78bfa" label="Engagement" />
                <Legend color="#22d3ee" label="Conversions" />
              </div>
              <MultiLineChart
                labels={LABELS}
                highlightIndex={highlight}
                series={[
                  { label: "Impressions", color: "#60a5fa", data: IMPRESSIONS },
                  { label: "Engagement", color: "#a78bfa", data: ENGAGEMENT },
                  { label: "Conversions", color: "#22d3ee", data: CONVERSIONS },
                ]}
              />
              <div className="mt-2 grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm sm:w-72">
                <p className="col-span-3 text-xs font-medium text-slate-400">{LABELS[highlight]}, 2026</p>
                <p className="text-blue-400">Impressions</p>
                <p className="col-span-2 text-right text-white">{IMPRESSIONS[highlight].toLocaleString()}</p>
                <p className="text-purple-400">Engagement</p>
                <p className="col-span-2 text-right text-white">{ENGAGEMENT[highlight].toLocaleString()}</p>
                <p className="text-cyan-400">Conversions</p>
                <p className="col-span-2 text-right text-white">{CONVERSIONS[highlight].toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-blue-500/5 p-5 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <BrainIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-white">AI Recommendation</p>
                  <p className="text-sm text-slate-400">
                    Increase content around "AI Automation" topic. Similar content drove 32% more engagement.
                  </p>
                </div>
              </div>
              <button className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                View Recommendation â†’
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat icon="trophy" label="Top Performing Content" primary="AI Automation: The Future of CRM" secondary="Engagement Rate" value="12.4%" color="#facc15" />
              <MiniStat icon="mail" label="Best Performing Channel" primary="Email Campaigns" secondary="Conversions" value="2.45K" color="#a78bfa" />
              <MiniStat icon="users" label="Audience Growth" primary="New Leads This Week" secondary="" value="2.18K" delta="+15.3%" color="#60a5fa" />
              <MiniStat icon="bolt" label="Automation Impact" primary="Time Saved This Week" secondary="" value="24.6h" delta="+31.7%" color="#38bdf8" />
            </div>
          </div>
        </div>

        {/* Recent activity + upgrade */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent Activity</h2>
              <button className="text-sm text-slate-400 hover:text-white">View All</button>
            </div>
            <div className="flex flex-col divide-y divide-slate-800">
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.title + a.time} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    <ActivityIcon type={a.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">{a.title}</p>
                      <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${STATUS_COLORS[a.status]}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{a.detail}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-500">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-5">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              <BrainIcon className="h-4 w-4 text-indigo-300" /> Upgrade to AI CRM Pro
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Unlock advanced AI insights, integrations, and automation tools.
            </p>
            <button className="mt-3 flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Upgrade Now â†’
            </button>
          </div>
        </aside>
      </div>

      <p className="mt-6 text-xs text-slate-600">
        AI Insights shown here are illustrative â€” this workspace does not yet have a connected analytics or automation backend.
      </p>
    </AppShell>
  );
}

function InsightStat({
  label,
  value,
  delta,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  delta: string;
  icon: string;
  trend: number[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-slate-400">
          <StatIcon type={icon} /> {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <span className="text-sm font-medium text-emerald-400">â†‘ {delta}</span>
      </div>
      <div className="mt-2">
        <Sparkline data={trend} color={color} height={40} />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  primary,
  secondary,
  value,
  delta,
  color,
}: {
  icon: string;
  label: string;
  primary: string;
  secondary: string;
  value: string;
  delta?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
        <StatIcon type={icon} color={color} /> {label}
      </p>
      <p className="mb-2 text-sm text-slate-200">{primary}</p>
      {secondary && <p className="text-xs text-slate-500">{secondary}</p>}
      <p className="text-xl font-bold text-white">
        {value} {delta && <span className="ml-1 text-sm font-medium text-emerald-400">â†‘ {delta}</span>}
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> {label}
    </span>
  );
}

function StatIcon({ type, color }: { type: string; color?: string }) {
  const style = color ? { color } : undefined;
  const common = "h-4 w-4";
  switch (type) {
    case "eye":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "engage":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="17" cy="6" r="2" />
          <circle cx="17" cy="16" r="2.5" />
          <path d="M10 9.5l5-1.7M10 10.5l5.2 4.2" />
        </svg>
      );
    case "click":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <path d="M8 3l9 6-3.5 1.2L16 15l-2 1-2.5-4.8L9 13.5 8 3z" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.7" fill="currentColor" />
        </svg>
      );
    case "trophy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
          <path d="M12 13v3M9 20h6M4 5h3v2a4 4 0 01-3.5 4M20 5h-3v2a4 4 0 003.5 4" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2.5 20c0-3 2.9-5.5 6.5-5.5s6.5 2.5 6.5 5.5" />
          <circle cx="17" cy="8" r="2.3" />
          <path d="M16 14.7c2.5.5 4.5 2.4 4.5 5.3" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common} style={style}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    default:
      return null;
  }
}

function ActivityIcon({ type }: { type: string }) {
  const common = "h-4 w-4";
  switch (type) {
    case "email":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
        </svg>
      );
    case "automation":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    case "report":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <path d="M4 20V10M11 20V4M18 20v-7" />
        </svg>
      );
    case "segment":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2.5 20c0-3 2.9-5.5 6.5-5.5s6.5 2.5 6.5 5.5" />
        </svg>
      );
    case "idea":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <path d="M9 18h6M10 22h4M12 2a6 6 0 00-3.6 10.8c.6.45 1.1 1.2 1.1 2.2h5c0-1 .5-1.75 1.1-2.2A6 6 0 0012 2z" />
        </svg>
      );
    case "sync":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={common}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      );
    default:
      return null;
  }
}

function BrainIcon({ className = "h-4 w-4 text-white" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M9 18h6M10 22h4M12 2a6 6 0 00-3.6 10.8c.6.45 1.1 1.2 1.1 2.2h5c0-1 .5-1.75 1.1-2.2A6 6 0 0012 2z" />
    </svg>
  );
}


