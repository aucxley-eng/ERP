"use client";

import { useActionState } from "react";
import ImageUploader from "@/components/image-uploader";
import { COUNTIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";

type ListingState = { error?: string };

type Initial = {
  id?: string;
  title?: string;
  description?: string;
  listingType?: string;
  propertyType?: string;
  price?: string;
  pricePeriod?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqft?: number | null;
  sizeAcres?: number | null;
  hasTitleDeed?: boolean;
  county?: string;
  town?: string;
  address?: string | null;
  amenities?: string[];
  images?: string[];
};

export default function ListingForm({
  action,
  initial = {},
}: {
  action: (prev: ListingState, formData: FormData) => Promise<ListingState>;
  initial?: Initial;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  const field =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Property details</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>Title</label>
            <input name="title" required defaultValue={initial.title} className={field} />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea
              name="description"
              required
              rows={5}
              defaultValue={initial.description}
              className={field}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Listing type</label>
              <select name="listingType" defaultValue={initial.listingType ?? "FOR_SALE"} className={field}>
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Property type</label>
              <select
                name="propertyType"
                defaultValue={initial.propertyType ?? "RESIDENTIAL_LAND"}
                className={field}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Price (KSh)</label>
              <input
                name="price"
                type="number"
                required
                defaultValue={initial.price}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Price period (optional)</label>
              <input
                name="pricePeriod"
                placeholder="e.g. per month"
                defaultValue={initial.pricePeriod ?? ""}
                className={field}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Specs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Bedrooms</label>
            <input name="bedrooms" type="number" min={0} defaultValue={initial.bedrooms ?? ""} className={field} />
          </div>
          <div>
            <label className={label}>Bathrooms</label>
            <input name="bathrooms" type="number" min={0} defaultValue={initial.bathrooms ?? ""} className={field} />
          </div>
          <div>
            <label className={label}>Size (sqft)</label>
            <input name="sizeSqft" type="number" defaultValue={initial.sizeSqft ?? ""} className={field} />
          </div>
          <div>
            <label className={label}>Size (acres)</label>
            <input name="sizeAcres" type="number" step="0.01" defaultValue={initial.sizeAcres ?? ""} className={field} />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="hasTitleDeed" defaultChecked={initial.hasTitleDeed} />
          Title deed available
        </label>
        <div className="mt-4">
          <label className={label}>Amenities / features (comma separated)</label>
          <input
            name="amenities"
            defaultValue={initial.amenities?.join(", ")}
            placeholder="Tarmac access, Water, Electricity"
            className={field}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>County</label>
            <select name="county" defaultValue={initial.county ?? "Nairobi"} className={field}>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Town / area</label>
            <input name="town" required defaultValue={initial.town} className={field} />
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>Address / landmark (optional)</label>
          <input name="address" defaultValue={initial.address ?? ""} className={field} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Photos</h2>
        <ImageUploader initial={initial.images ?? []} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button
          disabled={pending}
          className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save listing"}
        </button>
        <p className="self-center text-sm text-slate-500">
          New and edited listings are submitted for review.
        </p>
      </div>
    </form>
  );
}
