"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

interface ContentItem {
  title: string;
  type: string;
  stage: "Ideation" | "In Progress" | "Review" | "Published";
  owner: string;
}

const CONTENT_ITEMS: ContentItem[] = [
  { title: "Top 10 CRM Trends in 2026", type: "Blog Post", stage: "Ideation", owner: "Maria Chen" },
  { title: "How AI is Changing Sales", type: "Blog Post", stage: "Ideation", owner: "Ethan Carter" },
  { title: "Q3 Webinar Series", type: "Webinar", stage: "Ideation", owner: "Maria Chen" },
  { title: "AI for Lead Scoring", type: "Ebook", stage: "In Progress", owner: "Jordan Lee" },
  { title: "Customer Story: Acme Inc.", type: "Case Study", stage: "In Progress", owner: "Ethan Carter" },
  { title: "5 Automation Tips", type: "Blog Post", stage: "In Progress", owner: "Maria Chen" },
  { title: "Product Update: Summer 2026", type: "Launch Post", stage: "In Progress", owner: "Jordan Lee" },
  { title: "Lead Nurturing Best Practices", type: "Guide", stage: "Review", owner: "Ethan Carter" },
  { title: "Email Campaign: July", type: "Email", stage: "Review", owner: "Maria Chen" },
  { title: "The Future of CRM", type: "Blog Post", stage: "Published", owner: "Jordan Lee" },
  { title: "Why Automation Matters", type: "Blog Post", stage: "Published", owner: "Ethan Carter" },
  { title: "Webinar: AI in CRM", type: "Webinar", stage: "Published", owner: "Maria Chen" },
];

const STAGES: ContentItem["stage"][] = ["Ideation", "In Progress", "Review", "Published"];

const STAGE_COLORS: Record<ContentItem["stage"], string> = {
  Ideation: "bg-blue-50 text-blue-600",
  "In Progress": "bg-indigo-50 text-indigo-600",
  Review: "bg-amber-50 text-amber-600",
  Published: "bg-emerald-50 text-emerald-600",
};

export default function ContentPage() {
  const [filter, setFilter] = useState<ContentItem["stage"] | "All">("All");

  const filtered = useMemo(
    () => (filter === "All" ? CONTENT_ITEMS : CONTENT_ITEMS.filter((c) => c.stage === filter)),
    [filter]
  );

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          
<h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            Content
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Preview - not yet functional
            </span>
          </h1>
          <p className="text-sm text-gray-500">Manage your content pipeline, from idea to published.</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          + New Content
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...STAGES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.title} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.type}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[c.stage]}`}>{c.stage}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.owner}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No content in this stage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Demo content pipeline data â€” connect a content or CMS integration to manage real content here.
      </p>
    </AppShell>
  );
}


