"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";

interface Me {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const [me, setMe] = useState<Me | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((data) => setMe(data as Me))
      .catch(() => setLoadFailed(true));
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
          placeholder="Search contacts, deals..."
          className={`w-full rounded-lg border py-2 pl-9 pr-14 text-sm outline-none transition-colors focus:ring-2 ${
            dark
              ? "border-slate-800 bg-slate-900/60 text-slate-200 placeholder:text-slate-500 focus:ring-indigo-500/40"
              : "border-gray-200 bg-gray-50 text-gray-700 placeholder:text-gray-400 focus:ring-indigo-500/30"
          }`}
        />
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
            dark ? "border-slate-800 text-slate-300 hover:bg-slate-800/60" : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-semibold text-white">
            {me ? initials(me.full_name) : "…"}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {me ? me.full_name : loadFailed ? "Signed-in user" : "Loading…"}
            </p>
            <p className={`text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>{me ? me.email : ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
