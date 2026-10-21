import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBuyerViewings } from "@/lib/crm";
import { viewingStatusColor, viewingStatusLabel } from "@/lib/crm-constants";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountViewingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const viewings = await getBuyerViewings(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My viewings</h1>
      <p className="text-slate-500">Viewings you have requested.</p>

      {viewings.length ? (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {viewings.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-16 overflow-hidden rounded bg-slate-100">
                  {v.property.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.property.images[0].url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <Link
                    href={`/listings/${v.property.slug}`}
                    className="font-medium text-slate-900 hover:text-brand"
                  >
                    {v.property.title}
                  </Link>
                  <p className="text-sm text-slate-500">{formatDateTime(v.scheduledFor)}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${viewingStatusColor(v.status)}`}>
                {viewingStatusLabel(v.status)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          You have not booked any viewings yet.
        </p>
      )}
    </div>
  );
}
