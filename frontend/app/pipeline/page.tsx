"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Deal {
  id: string;
  contact_id: string;
  title: string;
  value: number | null;
  stage: string;
}

interface Contact {
  id: string;
  full_name: string;
}

const STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [contactId, setContactId] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function load() {
    api.listDeals().then((data) => setDeals(data as Deal[]));
    api.listContacts().then((data) => setContacts(data as Contact[]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId) return;
    await api.createDeal({
      contact_id: contactId,
      title,
      value: value ? parseFloat(value) : null,
      stage: "new",
    });
    setTitle("");
    setValue("");
    setContactId("");
    setShowForm(false);
    load();
  }

  async function moveDeal(dealId: string, stage: string) {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    await api.updateDeal(dealId, { stage });
  }

  async function handleDeleteDeal(dealId: string, title: string) {
    if (!confirm(`Delete deal "${title}"? This cannot be undone.`)) return;
    await api.deleteDeal(dealId);
    load();
  }

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.full_name || "Unknown";
  }

  return (
    <AppShell maxWidth="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
          >
            {showForm ? "Cancel" : "+ New Deal"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              required
            >
              <option value="">Select contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Deal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="number"
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
              Save
            </button>
          </form>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => draggedId && moveDeal(draggedId, stage.key)}
              className="w-64 flex-shrink-0 rounded-xl bg-gray-100 p-3"
            >
              <h3 className="mb-3 text-sm font-semibold text-gray-600">{stage.label}</h3>
              <div className="flex flex-col gap-2">
                {deals
                  .filter((d) => d.stage === stage.key)
                  .map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={() => setDraggedId(d.id)}
                      className="group cursor-move rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{d.title}</p>
                        <button
                          onClick={() => handleDeleteDeal(d.id, d.title)}
                          className="text-xs text-gray-300 hover:text-red-500 group-hover:text-gray-400"
                          title="Delete deal"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{contactName(d.contact_id)}</p>
                      {d.value !== null && (
                        <p className="mt-1 text-xs font-semibold text-brand">{d.value.toLocaleString()}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
    </AppShell>
  );
}
