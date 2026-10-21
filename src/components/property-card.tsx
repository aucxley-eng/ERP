import Link from "next/link";
import { formatPrice, formatSize } from "@/lib/format";
import { listingTypeLabel, propertyTypeLabel } from "@/lib/constants";

export type PropertyCardData = {
  slug: string;
  title: string;
  listingType: string;
  propertyType: string;
  price: unknown;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqft: number | null;
  sizeAcres: number | null;
  hasTitleDeed: boolean;
  featured: boolean;
  location: { county: string; town: string } | null;
  images: { url: string; alt: string | null }[];
};

export default function PropertyCard({ property }: { property: PropertyCardData }) {
  const image = property.images[0]?.url;
  const size = formatSize(property.sizeSqft, property.sizeAcres);

  return (
    <Link
      href={`/listings/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={property.images[0]?.alt ?? property.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {listingTypeLabel(property.listingType)}
          </span>
          {property.featured && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xl font-bold text-brand">
          {formatPrice(property.price as number, property.listingType)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-900">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="truncate">
            {property.location
              ? `${property.location.town}, ${property.location.county}`
              : "Kenya"}
          </span>
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-3 text-xs text-slate-600">
          {property.bedrooms != null && (
            <span className="rounded-lg bg-slate-100 px-2 py-1">{property.bedrooms} bed</span>
          )}
          {property.bathrooms != null && (
            <span className="rounded-lg bg-slate-100 px-2 py-1">{property.bathrooms} bath</span>
          )}
          <span className="rounded-lg bg-slate-100 px-2 py-1">
            {propertyTypeLabel(property.propertyType)}
          </span>
          {size && <span className="rounded-lg bg-slate-100 px-2 py-1">{size}</span>}
          {property.hasTitleDeed && (
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
              Title deed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
