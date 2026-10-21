import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getFollowUps, getUnreadNotificationCount, type Scope } from "@/lib/crm";
import { formatDateTime } from "@/lib/format";
import DashboardNav from "../../dashboard-nav";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const scope: Scope =
    session.user.role === "ADMIN" ? { admin: true } : { agentId: session.user.id };

  const [followUps, unread] = await Promise.all([
    getFollowUps(scope),
    getUnreadNotificationCount(session.user.id),
  ]);

  const overdue = followUps.filter((l) => l.overdue);
  const upcoming = followUps.filter((l) => !l.overdue);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <DashboardNav active="/dashboard/leads" unreadCount={unread} />
      <Link href="/dashboard/leads" className="text-sm text-brand hover:underline">
        ← Back to pipeline
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Follow-ups</h1>
      <p className="text-slate-500">
        {overdue.length} overdue · {upcoming.length} upcoming
      </p>

      <List title="Overdue" items={overdue} empty="Nothing overdue." />
      <List title="Upcoming" items={upcoming} empty="No scheduled follow-ups." />
    </div>
  );
}

function List({
  title,
  items,
  empty,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getFollowUps>>;
  empty: string;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {items.length ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <Link
                  href={`/dashboard/leads/${l.id}`}
                  className="font-medium text-slate-900 hover:text-brand"
                >
                  {l.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {l.property?.title ?? "No property"} · {l.email}
                </p>
              </div>
              <span
                className={`text-sm font-medium ${l.overdue ? "text-red-600" : "text-slate-600"}`}
              >
                {l.nextFollowUp ? formatDateTime(l.nextFollowUp) : "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {empty}
        </p>
      )}
    </div>
  );
}
