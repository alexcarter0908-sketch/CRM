"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getToken } from "@/lib/api";

export default function AppShell({
  children,
  dark = false,
  maxWidth = "max-w-7xl",
}: {
  children: React.ReactNode;
  dark?: boolean;
  maxWidth?: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#0b1120]" : "bg-gray-50"}`}>
        <p className={dark ? "text-slate-500" : "text-gray-400"}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${dark ? "bg-[#0b1120]" : "bg-gray-50"}`}>
      <Sidebar dark={dark} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar dark={dark} />
        <main className={`mx-auto w-full flex-1 ${maxWidth} px-6 py-8`}>{children}</main>
      </div>
    </div>
  );
}
