"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    budget_min: "",
    budget_max: "",
    preferred_city: "",
  });

  function load() {
    api.listContacts().then((data) => setContacts(data as Contact[]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.createContact({
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      source: form.source || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      preferred_city: form.preferred_city || null,
    });
    setForm({ full_name: "", email: "", phone: "", company: "", source: "", budget_min: "", budget_max: "", preferred_city: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api.deleteContact(id);
    load();
  }

  return (
    <AppShell maxWidth="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
        >
          {showForm ? "Cancel" : "+ New Contact"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Lead source (e.g. Facebook Ads)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Preferred city" value={form.preferred_city} onChange={(e) => setForm({ ...form, preferred_city: e.target.value })} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Budget min" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Budget max" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
          <p className="text-xs text-gray-400 sm:col-span-2">
            More property preferences (type, bedrooms) can be added from the contact's page after saving.
          </p>
          <button type="submit" className="col-span-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
            Save
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${c.id}`} className="font-medium text-brand hover:underline">
                    {c.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.email || "-"}</td>
                <td className="px-4 py-3">{c.phone || "-"}</td>
                <td className="px-4 py-3">{c.company || "-"}</td>
                <td className="px-4 py-3">{c.source || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(c.id, c.full_name)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No contacts found. Add a new contact.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
