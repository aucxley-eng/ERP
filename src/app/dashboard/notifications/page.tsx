import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/crm";
import { formatDateTime } from "@/lib/format";
import DashboardNav from "../dashboard-nav";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <DashboardNav active="/dashboard/notifications" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <form action={markAllNotificationsRead}>
          <button className="text-sm text-brand hover:underline">Mark all read</button>
        </form>
      </div>

      {notifications.length ? (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {notifications.map((n) => (
            <li key={n.id} className={`flex items-start justify-between gap-4 p-4 ${n.read ? "" : "bg-brand/5"}`}>
              <div>
                <p className="font-medium text-slate-900">
                  {n.link ? (
                    <Link href={n.link} className="hover:text-brand">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </p>
                {n.body && <p className="text-sm text-slate-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.read && (
                <form action={markNotificationRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="text-xs text-slate-500 hover:text-brand">Mark read</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          You have no notifications.
        </p>
      )}
    </div>
  );
}
