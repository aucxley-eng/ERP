import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatSize } from "@/lib/format";
import { listingTypeLabel, propertyTypeLabel } from "@/lib/constants";
import InquiryForm from "./inquiry-form";
import ViewingForm from "./viewing-form";
import { toggleFavorite } from "./actions";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function getProperty(slug: string) {
  return prisma.property.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { position: "asc" } },
      location: true,
      agent: {
        select: { id: true, name: true, email: true, phone: true, company: true, bio: true },
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property not found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  });

  const session = await auth();
  const isFavorited = session?.user?.id
    ? !!(await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: session.user.id,
            propertyId: property.id,
          },
        },
      }))
    : false;

  const size = formatSize(property.sizeSqft, property.sizeAcres);
  const isLand = property.propertyType.endsWith("_LAND");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:py-10 lg:pb-10">
      <Link href="/listings" className="text-sm text-brand hover:underline">
        ← Back to listings
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[16/10] bg-slate-100">
              {property.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.images[0].url}
                  alt={property.images[0].alt ?? property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-slate-400">No image</div>
              )}
            </div>
          </div>

          {property.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
              {property.images.slice(1, 9).map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt ?? property.title} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 sm:mt-6 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                {listingTypeLabel(property.listingType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {propertyTypeLabel(property.propertyType)}
              </span>
              {property.hasTitleDeed && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Title deed
                </span>
              )}
            </div>

            <h1 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
              {property.title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>
                {property.location
                  ? `${property.location.town}, ${property.location.county}`
                  : property.address ?? "Kenya"}
              </span>
            </p>
            <p className="mt-3 text-2xl font-bold text-brand sm:text-3xl">
              {formatPrice(property.price as unknown as number, property.listingType)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {!isLand && property.bedrooms != null && (
                <Stat label="Bedrooms" value={String(property.bedrooms)} />
              )}
              {!isLand && property.bathrooms != null && (
                <Stat label="Bathrooms" value={String(property.bathrooms)} />
              )}
              {size && <Stat label="Size" value={size} />}
              <Stat label="Views" value={String(property.views)} />
            </div>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">{property.description}</p>

            {property.amenities.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold text-slate-900">Features</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      {a}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Listed by
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white">
                {property.agent.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{property.agent.name}</p>
                {property.agent.company && (
                  <p className="text-sm text-slate-500">{property.agent.company}</p>
                )}
              </div>
            </div>
            {property.agent.phone && (
              <>
                <a
                  href={`tel:${property.agent.phone}`}
                  className="mt-4 block rounded-lg border border-brand px-4 py-2.5 text-center text-sm font-semibold text-brand hover:bg-brand/5"
                >
                  Call {property.agent.phone}
                </a>
                <a
                  href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, "")}`}
                  className="mt-2 block rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  WhatsApp agent
                </a>
              </>
            )}
          </div>

          <div id="enquire" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Book a viewing
            </h2>
            <ViewingForm
              propertyId={property.id}
              defaultName={session?.user?.name ?? undefined}
              defaultEmail={session?.user?.email ?? undefined}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Enquire about this property
            </h2>
            <InquiryForm
              propertyId={property.id}
              defaultName={session?.user?.name ?? undefined}
              defaultEmail={session?.user?.email ?? undefined}
            />
          </div>

          {session?.user && (
            <form action={toggleFavorite}>
              <input type="hidden" name="propertyId" value={property.id} />
              <button className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {isFavorited ? "★ Saved — remove" : "☆ Save to favourites"}
              </button>
            </form>
          )}
        </aside>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {property.agent.phone && (
            <a
              href={`tel:${property.agent.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand px-3 py-3 text-sm font-semibold text-brand"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
              </svg>
              Call
            </a>
          )}
          {property.agent.phone && (
            <a
              href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, "")}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2z" />
              </svg>
              WhatsApp
            </a>
          )}
          <a
            href="#enquire"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-3 py-3 text-sm font-semibold text-white"
          >
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
