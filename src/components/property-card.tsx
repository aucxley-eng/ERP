import Link from "next/link";
import { formatPrice, formatSize } from "@/lib/format";
import { listingTypeLabel, propertyTypeLabel } from "@/lib/constants";

export type PropertyCardData = {
  slug: string;
  title: string;
  listingType: string;
  propertyType: string;
  price: unknown;
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
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            {listingTypeLabel(property.listingType)}
          </span>
          {property.featured && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-lg font-bold text-brand">
          {formatPrice(property.price as number, property.listingType)}
        </p>
        <h3 className="line-clamp-1 font-semibold text-slate-900">{property.title}</h3>
        <p className="text-sm text-slate-500">
          {property.location
            ? `${property.location.town}, ${property.location.county}`
            : "Kenya"}
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-500">
          <span className="rounded bg-slate-100 px-2 py-1">
            {propertyTypeLabel(property.propertyType)}
          </span>
          {size && <span className="rounded bg-slate-100 px-2 py-1">{size}</span>}
          {property.hasTitleDeed && (
            <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
              Title deed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
