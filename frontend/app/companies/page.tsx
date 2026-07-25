"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  company: string | null;
}

interface Deal {
  id: string;
  contact_id: string;
  value: number | null;
  stage: string;
}

export default function CompaniesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    api.listContacts().then((data) => setContacts(data as Contact[])).catch(() => {});
    api.listDeals().then((data) => setDeals(data as Deal[])).catch(() => {});
  }, []);

  const companies = useMemo(() => {
    const map = new Map<string, Contact[]>();
    contacts.forEach((c) => {
      const key = c.company?.trim() || "Unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries())
      .map(([name, people]) => {
        const contactIds = new Set(people.map((p) => p.id));
        const companyDeals = deals.filter((d) => contactIds.has(d.contact_id));
        const openValue = companyDeals
          .filter((d) => d.stage !== "won" && d.stage !== "lost")
          .reduce((sum, d) => sum + (d.value || 0), 0);
        return { name, people, dealCount: companyDeals.length, openValue };
      })
      .sort((a, b) => b.people.length - a.people.length);
  }, [contacts, deals]);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500">Companies are grouped automatically from your contacts' company field.</p>
        </div>
      </div>

      {companies.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No companies yet. Add a company to a contact to see it here.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <div key={c.name} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.people.length} contact{c.people.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-gray-400">Open deals</p>
                <p className="font-semibold text-gray-800">{c.dealCount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-gray-400">Open value</p>
                <p className="font-semibold text-gray-800">${c.openValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {c.people.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/contacts/${p.id}`} className="truncate text-xs text-indigo-600 hover:underline">
                  {p.full_name}
                </Link>
              ))}
              {c.people.length > 3 && <p className="text-xs text-gray-400">+{c.people.length - 3} more</p>}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
