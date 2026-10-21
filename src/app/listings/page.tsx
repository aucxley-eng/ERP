import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import PropertyCard from "@/components/property-card";
import { getPublishedProperties } from "@/lib/properties";
import FiltersPanel from "./filters-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Properties for Sale & Rent in Kenya",
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined) {
  const s = one(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = num(sp.page) ?? 1;

  const filters = {
    q: one(sp.q),
    listingType: one(sp.listingType),
    propertyType: one(sp.propertyType),
    county: one(sp.county),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    bedrooms: num(sp.bedrooms),
    hasTitleDeed: one(sp.hasTitleDeed) === "1",
  };

  const result = await getPublishedProperties(filters, page, 9);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ ...sp, ...overrides }).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v[0] : v;
      if (val) params.set(k, val);
    });
    return `?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Property listings
        </h1>
        <p className="text-sm text-slate-500">
          {result.total} propert{result.total === 1 ? "y" : "ies"}
        </p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="lg:h-fit lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:p-5">
          <Suspense fallback={<div className="h-12 rounded-xl border border-slate-200 bg-white lg:hidden" />}>
            <FiltersPanel />
          </Suspense>
        </aside>

        <div>
          {result.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {result.items.map((p) => <PropertyCard key={p.slug} property={p} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-16">
              <p className="text-slate-600">No properties match your filters.</p>
              <Link href="/listings" className="mt-3 inline-block text-brand hover:underline">
                Clear filters
              </Link>
            </div>
          )}

          {result.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={buildQuery({ page: String(page - 1) })}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-slate-500">
                Page {page} of {result.pages}
              </span>
              {page < result.pages && (
                <Link
                  href={buildQuery({ page: String(page + 1) })}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
