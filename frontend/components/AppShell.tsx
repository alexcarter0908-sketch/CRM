"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useTheme } from "@/contexts/ThemeContext";
import { getToken } from "@/lib/api";

export default function AppShell({
  children,
  maxWidth = "max-w-7xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className={`flex min-h-screen ${dark ? "bg-[#0b1120]" : "bg-gray-50"}`}>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className={`mx-auto w-full flex-1 ${maxWidth} px-6 py-8`}>{children}</main>
      </div>
    </div>
  );
}
