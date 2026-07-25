"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

interface Property {
  id: string;
  title: string;
  address: string | null;
  property_type: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  status: string;
  description: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-600",
  under_offer: "bg-amber-50 text-amber-600",
  sold: "bg-gray-100 text-gray-500",
  rented: "bg-blue-50 text-blue-600",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [status, setStatus] = useState("available");
  const [description, setDescription] = useState("");

  function load() {
    api.listProperties().then((data) => setProperties(data as Property[]));
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setTitle("");
    setAddress("");
    setPropertyType("");
    setPrice("");
    setBedrooms("");
    setBathrooms("");
    setAreaSqft("");
    setStatus("available");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(p: Property) {
    setEditingId(p.id);
    setTitle(p.title);
    setAddress(p.address || "");
    setPropertyType(p.property_type || "");
    setPrice(p.price != null ? String(p.price) : "");
    setBedrooms(p.bedrooms != null ? String(p.bedrooms) : "");
    setBathrooms(p.bathrooms != null ? String(p.bathrooms) : "");
    setAreaSqft(p.area_sqft != null ? String(p.area_sqft) : "");
    setStatus(p.status);
    setDescription(p.description || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      address: address || null,
      property_type: propertyType || null,
      price: price ? parseFloat(price) : null,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
      area_sqft: areaSqft ? parseFloat(areaSqft) : null,
      status,
      description: description || null,
    };
    if (editingId) {
      await api.updateProperty(editingId, payload);
    } else {
      await api.createProperty(payload);
    }
    resetForm();
    load();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.deleteProperty(id);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function shareLink(propertyId: string) {
    const result = (await api.createPropertyShareLink(propertyId)) as { url: string };
    await navigator.clipboard.writeText(result.url).catch(() => {});
    alert(`Shareable listing link copied:\n${result.url}`);
  }

  return (
    <AppShell maxWidth="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
        >
          {showForm ? "Cancel" : "+ New Property"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-3">
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Title (e.g. 3BR Apartment, DHA Phase 6)" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Property type (e.g. apartment, house, plot)" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <select className="rounded-lg border border-gray-300 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="available">Available</option>
            <option value="under_offer">Under Offer</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Bedrooms" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Bathrooms" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          <input type="number" className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Area (sqft)" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} />
          <textarea className="col-span-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit" className="col-span-full rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">
            {editingId ? "Save Changes" : "Add Property"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-900">{p.title}</p>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-500"}`}>
                {p.status.replace("_", " ")}
              </span>
            </div>
            {p.address && <p className="mb-1 text-sm text-gray-500">{p.address}</p>}
            <p className="mb-2 text-sm text-gray-500">
              {p.property_type || "Type n/a"}
              {p.bedrooms != null && ` · ${p.bedrooms} bed`}
              {p.bathrooms != null && ` · ${p.bathrooms} bath`}
              {p.area_sqft != null && ` · ${p.area_sqft} sqft`}
            </p>
            {p.price != null && <p className="mb-3 text-lg font-bold text-brand">${p.price.toLocaleString()}</p>}
            <div className="flex gap-3 text-xs">
              <button onClick={() => startEdit(p)} className="font-medium text-brand hover:underline">
                Edit
              </button>
              <button onClick={() => shareLink(p.id)} className="font-medium text-indigo-500 hover:underline">
                Get Link
              </button>
              <button onClick={() => handleDelete(p.id, p.title)} className="font-medium text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-gray-500">
            No properties yet. Add one to start linking it to deals.
          </p>
        )}
      </div>
    </AppShell>
  );
}
