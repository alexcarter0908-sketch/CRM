"use client";

import AppShell from "@/components/AppShell";

export default function ContentPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <p className="text-sm text-gray-500">Plan and track marketing content from idea to publish.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
            <rect x="4" y="3.5" width="16" height="17" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        </div>
        <p className="mb-1 font-semibold text-gray-900">No content yet</p>
        <p className="max-w-sm text-sm text-gray-500">
          This feature isn't built yet. Once ready, you'll be able to track blog posts, campaigns and other
          content through stages like Ideation, In Progress, Review and Published.
        </p>
      </div>
    </AppShell>
  );
}
