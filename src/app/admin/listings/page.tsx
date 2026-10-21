import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { statusLabel, propertyTypeLabel } from "@/lib/constants";
import { setListingStatus, setFeatured } from "../actions";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "", label: "All" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const { status } = await searchParams;
  const active = status ?? "PENDING";

  const listings = await prisma.property.findMany({
    where: active ? { status: active as never } : {},
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { name: true, email: true } },
      location: true,
      images: { take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Moderate listings</h1>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/listings?status=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium ${
              active === tab.value
                ? "border-b-2 border-brand text-brand"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {listings.length ? (
          listings.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{p.title}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {statusLabel(p.status)}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {propertyTypeLabel(p.propertyType)} ·{" "}
                    {formatPrice(p.price as unknown as number, p.listingType)} ·{" "}
                    {p.location ? `${p.location.town}, ${p.location.county}` : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    By {p.agent.name} ({p.agent.email})
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {p.status !== "PUBLISHED" && (
                      <StatusButton id={p.id} status="PUBLISHED" label="Approve & publish" primary />
                    )}
                    {p.status !== "REJECTED" && (
                      <StatusButton id={p.id} status="REJECTED" label="Reject" />
                    )}
                    {p.status === "PUBLISHED" && (
                      <>
                        <StatusButton id={p.id} status="SOLD" label="Mark sold" />
                        <StatusButton id={p.id} status="PENDING" label="Unpublish" />
                      </>
                    )}
                    <form action={setFeatured}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="featured" value={p.featured ? "0" : "1"} />
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                        {p.featured ? "Unfeature" : "Feature"}
                      </button>
                    </form>
                    <Link
                      href={`/listings/${p.slug}`}
                      className="rounded-lg px-3 py-1.5 text-sm text-brand hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
            Nothing here.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setListingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
          primary
            ? "bg-brand text-white hover:bg-brand-light"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
