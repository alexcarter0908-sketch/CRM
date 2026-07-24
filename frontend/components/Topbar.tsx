"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export default function Topbar({ dark = false }: { dark?: boolean }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data as CurrentUser))
      .catch(() => setUser(null));
  }, []);

  return (
    <header
      className={`flex items-center justify-between gap-4 border-b px-6 py-4 ${
        dark ? "border-slate-800 bg-[#0b1120]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="relative w-full max-w-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            dark ? "text-slate-500" : "text-gray-400"
          }`}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.2-3.2" />
        </svg>
        <input
          type="text"
          placeholder="Search contacts, deals, automations…"
          className={`w-full rounded-lg border py-2 pl-9 pr-14 text-sm outline-none transition-colors focus:ring-2 ${
            dark
              ? "border-slate-800 bg-slate-900/60 text-slate-200 placeholder:text-slate-500 focus:ring-indigo-500/40"
              : "border-gray-200 bg-gray-50 text-gray-700 placeholder:text-gray-400 focus:ring-indigo-500/30"
          }`}
        />
        <kbd
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 text-[10px] ${
            dark ? "border-slate-700 text-slate-500" : "border-gray-300 text-gray-400"
          }`}
        >
          ?K
        </kbd>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg ${
            dark ? "border-slate-800 text-slate-300 hover:bg-slate-800/60" : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
          title="Quick add"
        >
          +
        </button>
        <button
          className={`relative flex h-9 w-9 items-center justify-center rounded-full border ${
            dark ? "border-slate-800 text-slate-300 hover:bg-slate-800/60" : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
          title="Notifications"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" />
            <path d="M10 18a2 2 0 004 0" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-indigo-500" />
        </button>
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-semibold text-white">
            {user ? initials(user.full_name) : "…"}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {user ? user.full_name : "Loading..."}
            </p>
            <p className={`text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
