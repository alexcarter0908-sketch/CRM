"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface PublicProperty {
  title: string;
  address: string | null;
  property_type: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  description: string | null;
}

export default function PublicListingPage() {
  const params = useParams();
  const token = params.token as string;

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPublicProperty(token)
      .then((data) => setProperty(data as PublicProperty))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load this listing."));
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        {!error && !property && <p className="text-center text-sm text-gray-500">Loading listing…</p>}

        {property && (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">Property Listing</p>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">{property.title}</h1>
            {property.address && <p className="mb-3 text-sm text-gray-500">{property.address}</p>}

            {property.price !== null && (
              <p className="mb-4 text-3xl font-bold text-gray-900">
                ${property.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            )}

            <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600">
              {property.property_type && (
                <span className="rounded-full bg-gray-100 px-3 py-1 capitalize">{property.property_type}</span>
              )}
              {property.bedrooms !== null && <span className="rounded-full bg-gray-100 px-3 py-1">{property.bedrooms} bed</span>}
              {property.bathrooms !== null && <span className="rounded-full bg-gray-100 px-3 py-1">{property.bathrooms} bath</span>}
              {property.area_sqft !== null && <span className="rounded-full bg-gray-100 px-3 py-1">{property.area_sqft} sqft</span>}
            </div>

            {property.description && <p className="whitespace-pre-line text-gray-600">{property.description}</p>}

            <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
              Interested? Reply to the agent who shared this link with you to schedule a visit.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
