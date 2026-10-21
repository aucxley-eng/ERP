import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getViewings, getUnreadNotificationCount, type Scope } from "@/lib/crm";
import { viewingStatusColor, viewingStatusLabel } from "@/lib/crm-constants";
import { formatDateTime } from "@/lib/format";
import DashboardNav from "../dashboard-nav";
import ViewingRowActions from "./viewing-row-actions";

export const dynamic = "force-dynamic";

export default async function ViewingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const scope: Scope =
    session.user.role === "ADMIN" ? { admin: true } : { agentId: session.user.id };

  const [viewings, unread] = await Promise.all([
    getViewings(scope),
    getUnreadNotificationCount(session.user.id),
  ]);

  const pending = viewings.filter((v) => v.status === "REQUESTED");
  const active = viewings.filter((v) =>
    ["CONFIRMED", "RESCHEDULED"].includes(v.status),
  );
  const past = viewings.filter((v) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(v.status),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <DashboardNav active="/dashboard/viewings" unreadCount={unread} />
      <h1 className="text-2xl font-bold text-slate-900">Viewings</h1>
      <p className="text-slate-500">
        {pending.length} pending · {active.length} upcoming · {past.length} closed
      </p>

      <Section title="Pending requests" viewings={pending} empty="No pending requests." />
      <Section title="Scheduled" viewings={active} empty="Nothing scheduled." />
      <Section title="Closed" viewings={past} empty="No closed viewings." />
    </div>
  );
}

function Section({
  title,
  viewings,
  empty,
}: {
  title: string;
  viewings: Awaited<ReturnType<typeof getViewings>>;
  empty: string;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {viewings.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {viewings.map((v) => (
              <li key={v.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{v.property.title}</p>
                    <p className="text-sm text-slate-500">
                      {v.buyer?.name ?? "Guest"} · {v.buyer?.email ?? v.buyer?.phone ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDateTime(v.scheduledFor)} · {v.durationMins} min
                    </p>
                    {v.notes && (
                      <p className="mt-1 text-xs text-slate-500">Note: {v.notes}</p>
                    )}
                    {v.lead && (
                      <Link
                        href={`/dashboard/leads/${v.lead.id}`}
                        className="mt-1 inline-block text-xs text-brand hover:underline"
                      >
                        View lead →
                      </Link>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${viewingStatusColor(v.status)}`}
                  >
                    {viewingStatusLabel(v.status)}
                  </span>
                </div>
                <div className="mt-3">
                  <ViewingRowActions
                    viewingId={v.id}
                    status={v.status}
                    scheduledFor={v.scheduledFor.toISOString()}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {empty}
        </p>
      )}
    </div>
  );
}
