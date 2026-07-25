"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Property {
  id: string;
  title: string;
  property_type: string;
  status: string;
  price: number | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
}

const PROPERTY_TYPES = ["house", "apartment", "plot", "commercial"];
const STATUSES = ["available", "reserved", "sold"];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-600",
  reserved: "bg-amber-50 text-amber-600",
  sold: "bg-gray-100 text-gray-500",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    property_type: "apartment",
    status: "available",
    price: "",
    city: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    size_sqft: "",
    description: "",
  });

  function refresh() {
    setLoading(true);
    api
      .listProperties()
      .then((data) => setProperties(data as Property[]))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createProperty({
        title: form.title,
        property_type: form.property_type,
        status: form.status,
        price: form.price ? Number(form.price) : null,
        city: form.city || null,
        address: form.address || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        size_sqft: form.size_sqft ? Number(form.size_sqft) : null,
        description: form.description || null,
      });
      setShowForm(false);
      setForm({
        title: "",
        property_type: "apartment",
        status: "available",
        price: "",
        city: "",
        address: "",
        bedrooms: "",
        bathrooms: "",
        size_sqft: "",
        description: "",
      });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save property.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500">Your real listings — used by the property matching engine.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ New Property"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g. DHA 3-bed Apartment"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Property Type</span>
              <select
                value={form.property_type}
                onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Price</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="7500000"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">City</span>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Lahore"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Address</span>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Bedrooms</span>
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Bathrooms</span>
              <input
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Size (sqft)</span>
              <input
                type="number"
                value={form.size_sqft}
                onChange={(e) => setForm({ ...form, size_sqft: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-gray-600">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={2}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Property"}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && properties.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No properties yet. Add your first listing to start matching it against your clients.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <p className="font-semibold text-gray-900">{p.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                {p.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 capitalize">
              {p.property_type} {p.city ? `· ${p.city}` : ""}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              {p.price !== null && <span className="font-semibold text-gray-800">${p.price.toLocaleString()}</span>}
              {p.bedrooms !== null && <span>{p.bedrooms} bed</span>}
              {p.bathrooms !== null && <span>{p.bathrooms} bath</span>}
              {p.size_sqft !== null && <span>{p.size_sqft} sqft</span>}
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
