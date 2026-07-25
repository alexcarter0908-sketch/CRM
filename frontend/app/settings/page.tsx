"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/contexts/ThemeContext";
import { api, clearToken } from "@/lib/api";

interface Me {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then((data) => setMe(data as Me))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <AppShell maxWidth="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Your account details and app preferences.</p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Profile</h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && me && (
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-lg font-semibold text-white">
              {me.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{me.full_name}</p>
              <p className="text-sm text-gray-500">{me.email}</p>
            </div>
          </div>
        )}
        {!loading && !me && <p className="text-sm text-red-500">Couldn't load your profile.</p>}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Theme</p>
            <p className="text-xs text-gray-500">Choose how the CRM looks on this device.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Account</h2>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Log out
        </button>
      </div>
    </AppShell>
  );
}
