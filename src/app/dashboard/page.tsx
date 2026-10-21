import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { statusLabel } from "@/lib/constants";
import { getLeadMetrics, getUpcomingViewings, getUnreadNotificationCount, type Scope } from "@/lib/crm";
import { formatDateTime } from "@/lib/format";
import DashboardNav from "./dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const agentId = session.user.id;
  const scope: Scope =
    session.user.role === "ADMIN" ? { admin: true } : { agentId: session.user.id };

  // Keep DB concurrency bounded: the Supabase pooler limits connections, so we
  // fetch sequentially rather than fanning out many parallel queries.
  const counts = await prisma.property.groupBy({
    by: ["status"],
    where: { agentId },
    _count: true,
  });
  const unread = await prisma.inquiry.count({ where: { agentId, read: false } });
  const recent = await prisma.property.findMany({
    where: { agentId },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { location: true },
  });
  const metrics = await getLeadMetrics(scope);
  const upcoming = await getUpcomingViewings(scope);
  const unreadNotif = await getUnreadNotificationCount(session.user.id);

  const byStatus = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <DashboardNav active="/dashboard" unreadCount={unreadNotif} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent dashboard</h1>
          <p className="text-slate-500">Welcome back, {session.user.name}</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
        >
          + New listing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Active leads" value={metrics.total} />
        <Metric label="Won" value={metrics.won} />
        <Metric label="Conversion" value={metrics.conversion} suffix="%" />
        <Metric label="Upcoming viewings" value={metrics.upcoming} accent />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Published" value={byStatus("PUBLISHED")} />
        <Metric label="Pending review" value={byStatus("PENDING")} />
        <Metric label="Drafts" value={byStatus("DRAFT")} />
        <Metric label="Unread enquiries" value={unread} accent />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">Upcoming viewings</h2>
            <Link href="/dashboard/viewings" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((v) => (
                <li key={v.id} className="p-5">
                  <p className="font-medium text-slate-900">{v.property.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(v.scheduledFor)} · {v.buyer?.name ?? "Guest"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-slate-500">No upcoming viewings.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">Recent listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-slate-100">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <p className="text-sm text-slate-500">
                      {p.location ? `${p.location.town}, ${p.location.county}` : "—"} ·{" "}
                      {formatPrice(p.price as unknown as number, p.listingType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={p.status} />
                    <Link
                      href={`/dashboard/listings/${p.id}/edit`}
                      className="text-sm text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-slate-500">No listings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  accent?: boolean;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-accent" : "text-slate-900"}`}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-red-50 text-red-700",
    DRAFT: "bg-slate-100 text-slate-600",
    SOLD: "bg-blue-50 text-blue-700",
    RENTED: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] ?? "bg-slate-100"}`}>
      {statusLabel(status)}
    </span>
  );
}
