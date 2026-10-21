import Link from "next/link";
import PropertyCard from "@/components/property-card";
import { getPublishedProperties, PROPERTY_CARD_SELECT } from "@/lib/properties";
import { prisma } from "@/lib/prisma";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";

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
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Verified Kenyan property
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Find land, homes and commercial property you can trust
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            ERNT Properties lists verified plots, houses and investments across Kenya —
            with clear titles and responsive agents.
          </p>

          <form
            action="/listings"
            className="mt-8 grid gap-3 rounded-xl bg-white p-3 shadow-lg sm:grid-cols-[1fr_auto_auto]"
          >
            <input
              name="q"
              placeholder="Search town, county or keyword..."
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand"
            />
            <select
              name="propertyType"
              defaultValue=""
              className="rounded-lg border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-brand"
            >
              <option value="">Any type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button className="rounded-lg bg-accent px-6 py-3 font-semibold text-brand transition hover:brightness-110">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {LISTING_TYPES.map((t) => (
              <Link
                key={t.value}
                href={`/listings?listingType=${t.value}`}
                className="rounded-full border border-white/30 px-4 py-1.5 hover:bg-white/10"
              >
                Browse {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured properties</h2>
          <Link href="/listings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        {featured.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <PropertyCard key={p.slug} property={p} />)}
          </div>
        ) : (
          <p className="mt-6 text-slate-500">No featured listings yet.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Latest listings</h2>
          <Link href="/listings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
