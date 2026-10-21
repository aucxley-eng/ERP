import Link from "next/link";
import type { Metadata } from "next";
import PropertyCard from "@/components/property-card";
import { getPublishedProperties } from "@/lib/properties";
import { COUNTIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Property listings</h1>
      <p className="mt-1 text-slate-500">
        {result.total} propert{result.total === 1 ? "y" : "ies"} found
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <form method="get" className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Keyword</label>
              <input
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Town, county..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Listing</label>
              <select
                name="listingType"
                defaultValue={filters.listingType ?? ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">Any</option>
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <select
                name="propertyType"
                defaultValue={filters.propertyType ?? ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">Any</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">County</label>
              <select
                name="county"
                defaultValue={filters.county ?? ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">Any</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Min (KSh)</label>
                <input
                  name="minPrice"
                  type="number"
                  defaultValue={filters.minPrice ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Max (KSh)</label>
                <input
                  name="maxPrice"
                  type="number"
                  defaultValue={filters.maxPrice ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="hasTitleDeed" value="1" defaultChecked={filters.hasTitleDeed} />
              Title deed available
            </label>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light">
                Apply
              </button>
              <Link
                href="/listings"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </Link>
            </div>
          </form>
        </aside>

        <div>
          {result.items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((p) => <PropertyCard key={p.slug} property={p} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
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
