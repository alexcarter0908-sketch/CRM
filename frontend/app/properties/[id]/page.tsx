"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
  description: string | null;
}

interface ClientMatch {
  score: number;
  reasons: string[];
  missing: string[];
  contact: { id: string; full_name: string; email: string | null };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([api.getProperty(id), api.getClientMatchesForProperty(id)])
      .then(([p, m]) => {
        setProperty(p as Property);
        setMatches(m as ClientMatch[]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this property?")) return;
    setDeleting(true);
    await api.deleteProperty(id);
    router.push("/properties");
  }

  if (loading) {
    return (
      <AppShell maxWidth="max-w-4xl">
        <p className="text-sm text-gray-500">Loading…</p>
      </AppShell>
    );
  }

  if (!property) {
    return (
      <AppShell maxWidth="max-w-4xl">
        <p className="text-sm text-gray-500">Property not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-sm capitalize text-gray-500">
            {property.property_type} · {property.status} {property.city ? `· ${property.city}` : ""}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Fact label="Price" value={property.price !== null ? `$${property.price.toLocaleString()}` : "—"} />
        <Fact label="Bedrooms" value={property.bedrooms?.toString() || "—"} />
        <Fact label="Bathrooms" value={property.bathrooms?.toString() || "—"} />
        <Fact label="Size" value={property.size_sqft ? `${property.size_sqft} sqft` : "—"} />
      </div>

      {property.description && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-1 text-sm font-semibold text-gray-900">Description</p>
          <p className="text-sm text-gray-600">{property.description}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Matched Clients</h2>
        <p className="mb-4 text-xs text-gray-500">
          Scored against each client's stated preferences (budget, city, type, bedrooms). This is a
          transparent, rule-based score — every point is explained below.
        </p>

        {matches.length === 0 && (
          <p className="text-sm text-gray-500">
            No matching clients yet. Add budget/city/type/bedroom preferences to your contacts to see matches
            here.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <Link
              key={m.contact.id}
              href={`/contacts/${m.contact.id}`}
              className="rounded-lg border border-gray-100 p-4 hover:border-indigo-200"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium text-gray-900">{m.contact.full_name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    m.score >= 70
                      ? "bg-emerald-50 text-emerald-600"
                      : m.score >= 40
                      ? "bg-amber-50 text-amber-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.score}% match
                </span>
              </div>
              {m.reasons.length > 0 && (
                <ul className="mb-1 list-inside list-disc text-xs text-emerald-700">
                  {m.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
              {m.missing.length > 0 && (
                <ul className="list-inside list-disc text-xs text-gray-400">
                  {m.missing.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
