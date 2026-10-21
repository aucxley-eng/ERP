import Link from "next/link";
import PropertyCard from "@/components/property-card";
import { getPublishedProperties, PROPERTY_CARD_SELECT } from "@/lib/properties";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    prisma.property.findMany({
      where: { status: "PUBLISHED", featured: true },
      select: PROPERTY_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    getPublishedProperties({}, 1, 6),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent sm:text-sm">
            Verified Kenyan property
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Find land, homes and commercial property you can trust
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            ERNT Properties lists verified plots, houses and investments across
            Kenya — with clear titles and responsive agents.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <Link
              href="/listings"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 sm:text-base"
            >
              Browse properties
            </Link>
            <Link
              href="/listings?listingType=FOR_SALE"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10 sm:text-base"
            >
              For sale
            </Link>
            <Link
              href="/listings?listingType=FOR_RENT"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10 sm:text-base"
            >
              For rent
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.slice(0, 6).map((t) => (
            <Link
              key={t.value}
              href={`/listings?propertyType=${t.value}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand hover:text-brand sm:text-sm"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Featured properties
          </h2>
          <Link href="/listings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        {featured.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {featured.map((p) => <PropertyCard key={p.slug} property={p} />)}
          </div>
        ) : (
          <p className="mt-6 text-slate-500">No featured listings yet.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Latest listings</h2>
          <Link href="/listings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {latest.items.map((p) => <PropertyCard key={p.slug} property={p} />)}
        </div>
        {!latest.items.length && (
          <p className="mt-6 text-slate-500">
            No listings yet. Seed the database to see sample properties.
          </p>
        )}
      </section>
    </div>
  );
}
