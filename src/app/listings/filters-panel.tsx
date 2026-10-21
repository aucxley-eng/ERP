"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COUNTIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";

const field =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand";

export default function FiltersPanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const value = (k: string) => params.get(k) ?? "";
  const activeCount = [
    "q",
    "listingType",
    "propertyType",
    "county",
    "minPrice",
    "maxPrice",
    "bedrooms",
    "hasTitleDeed",
  ].filter((k) => params.get(k)).length;

  function reset() {
    router.push(pathname);
    setOpen(false);
  }

  return (
    <div>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <form
        method="get"
        className={`${
          open ? "block" : "hidden"
        } mt-3 space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:mt-0 lg:block`}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Keyword</label>
          <input
            name="q"
            defaultValue={value("q")}
            placeholder="Town, county..."
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Listing</label>
            <select name="listingType" defaultValue={value("listingType")} className={field}>
              <option value="">Any</option>
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <select name="propertyType" defaultValue={value("propertyType")} className={field}>
              <option value="">Any</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">County</label>
          <select name="county" defaultValue={value("county")} className={field}>
            <option value="">Any</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Min (KSh)</label>
            <input
              name="minPrice"
              type="number"
              inputMode="numeric"
              defaultValue={value("minPrice")}
              className={field}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Max (KSh)</label>
            <input
              name="maxPrice"
              type="number"
              inputMode="numeric"
              defaultValue={value("maxPrice")}
              className={field}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Min bedrooms</label>
          <input
            name="bedrooms"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={value("bedrooms")}
            className={field}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="hasTitleDeed"
            value="1"
            defaultChecked={value("hasTitleDeed") === "1"}
            className="h-4 w-4"
          />
          Title deed available
        </label>

        <div className="flex gap-2 pt-1">
          <button className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-light">
            Apply filters
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
