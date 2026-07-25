"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/contacts", label: "Contacts", icon: ContactsIcon },
  { href: "/pipeline", label: "Deals", icon: DealsIcon },
  { href: "/properties", label: "Properties", icon: PropertyIcon },
  { href: "/companies", label: "Companies", icon: CompaniesIcon },
  { href: "/followups", label: "Tasks", icon: TasksIcon },
  { href: "/automations", label: "Automations", icon: AutomationsIcon },
  { href: "/content", label: "Content", icon: ContentIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/reports", label: "Reports", icon: AnalyticsIcon },
  { href: "/ai-insights", label: "AI Insights", icon: SparkleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <aside
      className={`flex h-screen w-64 flex-shrink-0 flex-col border-r px-4 py-6 ${
        dark ? "border-slate-800 bg-[#0b1120] text-slate-300" : "border-gray-200 bg-white text-gray-700"
      }`}
    >
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
          <SparkleIcon className="h-4 w-4" />
        </span>
        <span className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>AI CRM</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? dark
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "bg-indigo-50 text-indigo-600"
                  : dark
                  ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {link.label}
            </Link>
          );
        })}

        <div className={`my-3 border-t ${dark ? "border-slate-800" : "border-gray-100"}`} />

        <Link
          href="/notifications"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/notifications"
              ? dark
                ? "bg-indigo-500/15 text-indigo-300"
                : "bg-indigo-50 text-indigo-600"
              : dark
              ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <BellIcon className="h-[18px] w-[18px]" /> Notifications
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/settings"
              ? dark
                ? "bg-indigo-500/15 text-indigo-300"
                : "bg-indigo-50 text-indigo-600"
              : dark
              ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <SettingsIcon className="h-[18px] w-[18px]" /> Settings
        </Link>
      </nav>

      <div
        className={`mt-4 rounded-xl p-4 ${
          dark ? "bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/20" : "bg-gray-50 border border-gray-100"
        }`}
      >
        <p className={`flex items-center gap-1.5 text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          <SparkleIcon className="h-4 w-4 text-indigo-500" /> Upgrade to Pro
        </p>
        <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-gray-500"}`}>
          Unlock advanced AI features and insights.
        </p>
        <button className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
          Upgrade Now
        </button>
      </div>

      <button
        onClick={handleLogout}
        className={`mt-3 rounded-lg px-3 py-2 text-left text-xs font-medium ${
          dark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-700"
        }`}
      >
        Log out
      </button>
    </aside>
  );
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function ContactsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}
function DealsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.7 9.8c0-1.1-1.2-2-2.7-2s-2.7.8-2.7 1.9c0 3 5.4 1.5 5.4 4.4 0 1.1-1.2 2-2.7 2s-2.7-.9-2.7-2" />
    </svg>
  );
}
function PropertyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
  );
}
function CompaniesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="4" y="4" width="9" height="16" rx="1" />
      <rect x="14" y="9" width="6" height="11" rx="1" />
      <path d="M7 8h3M7 12h3M7 16h3" />
    </svg>
  );
}
function TasksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M8 12.5l2.3 2.3L16 9.5" />
    </svg>
  );
}
function AutomationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="7" r="3" />
      <path d="M12 10v3M6 21v-2a3 3 0 013-3h6a3 3 0 013 3v2" />
    </svg>
  );
}
function ContentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function AnalyticsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
    </svg>
  );
}
export function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" opacity="0.7" />
    </svg>
  );
}
function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" />
      <path d="M10 18a2 2 0 004 0" />
    </svg>
  );
}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.3-1a7 7 0 002 1.2l.4 2.6h4.4l.4-2.6a7 7 0 002-1.2l2.3 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
    </svg>
  );
}
