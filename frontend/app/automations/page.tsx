"use client";

import AppShell from "@/components/AppShell";

export default function AutomationsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
        <p className="text-sm text-gray-500">Set up rules that act automatically on your contacts and deals.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
            <circle cx="12" cy="7" r="3" />
            <path d="M12 10v3M6 21v-2a3 3 0 013-3h6a3 3 0 013 3v2" />
          </svg>
        </div>
        <p className="mb-1 font-semibold text-gray-900">No automations yet</p>
        <p className="max-w-sm text-sm text-gray-500">
          This feature isn't built yet. Once ready, you'll be able to create rules like sending a reminder
          email or creating a task automatically when a deal changes stage.
        </p>
      </div>
    </AppShell>
  );
}
