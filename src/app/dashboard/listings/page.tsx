import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { statusLabel, propertyTypeLabel } from "@/lib/constants";
import { deleteListing } from "../actions";
import DashboardNav from "../dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const listings = await prisma.property.findMany({
    where: { agentId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { location: true, images: { take: 1 }, _count: { select: { inquiries: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <DashboardNav active="/dashboard/listings" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
        >
          + New listing
        </Link>
      </div>

      {listings.length ? (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enquiries</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 overflow-hidden rounded bg-slate-100">
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">
                          {p.location ? `${p.location.town}, ${p.location.county}` : "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{propertyTypeLabel(p.propertyType)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatPrice(p.price as unknown as number, p.listingType)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p._count.inquiries}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/dashboard/listings/${p.id}/edit`} className="text-brand hover:underline">
                        Edit
                      </Link>
                      <form action={deleteListing}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-red-600 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <p className="text-slate-600">You have no listings yet.</p>
          <Link
            href="/dashboard/listings/new"
            className="mt-3 inline-block font-medium text-brand hover:underline"
          >
            Create your first listing
          </Link>
        </div>
      )}
    </div>
  );
}
