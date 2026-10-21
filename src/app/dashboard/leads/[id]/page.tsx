import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLead, getUnreadNotificationCount, type Scope } from "@/lib/crm";
import { leadStageLabel, viewingStatusLabel } from "@/lib/crm-constants";
import { formatDateTime } from "@/lib/format";
import DashboardNav from "../../dashboard-nav";
import LeadStageSelect from "../lead-stage-select";
import LeadEditForm from "./lead-edit-form";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const scope: Scope =
    session.user.role === "ADMIN" ? { admin: true } : { agentId: session.user.id };

  const { id } = await params;
  const [lead, unread] = await Promise.all([
    getLead(scope, id),
    getUnreadNotificationCount(session.user.id),
  ]);
  if (!lead) notFound();

  const fmtLocal = (d: Date | null) =>
    d
      ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <DashboardNav active="/dashboard/leads" unreadCount={unread} />
      <Link href="/dashboard/leads" className="text-sm text-brand hover:underline">
        ← Back to pipeline
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <p className="text-slate-500">
            {lead.email}
            {lead.phone ? ` · ${lead.phone}` : ""}
          </p>
        </div>
        <LeadStageSelect leadId={lead.id} stage={lead.stage} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Details</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Stage</dt>
                <dd className="font-medium text-slate-900">{leadStageLabel(lead.stage)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Source</dt>
                <dd className="font-medium text-slate-900">{lead.source}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Property</dt>
                <dd className="font-medium text-slate-900">
                  {lead.property ? (
                    <Link href={`/listings/${lead.property.slug}`} className="text-brand hover:underline">
                      {lead.property.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Next follow-up</dt>
                <dd className="font-medium text-slate-900">
                  {lead.nextFollowUp ? formatDateTime(lead.nextFollowUp) : "—"}
                </dd>
              </div>
            </dl>
            {lead.inquiry && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Original enquiry</p>
                <p className="mt-1 text-sm text-slate-600">{lead.inquiry.message}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Edit lead</h2>
            <LeadEditForm
              leadId={lead.id}
              notes={lead.notes ?? ""}
              nextFollowUp={fmtLocal(lead.nextFollowUp)}
              budgetMin={lead.budgetMin ? String(lead.budgetMin) : ""}
              budgetMax={lead.budgetMax ? String(lead.budgetMax) : ""}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Viewings</h2>
            {lead.viewings.length ? (
              <ul className="space-y-3">
                {lead.viewings.map((v) => (
                  <li key={v.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">{formatDateTime(v.scheduledFor)}</p>
                    <p className="text-xs text-slate-500">{viewingStatusLabel(v.status)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No viewings yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Activity</h2>
            {lead.activities.length ? (
              <ol className="space-y-3">
                {lead.activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-slate-200 pl-3">
                    <p className="text-sm font-medium text-slate-900">{a.action}</p>
                    {a.detail && <p className="text-xs text-slate-500">{a.detail}</p>}
                    <p className="text-[11px] text-slate-400">
                      {a.actor?.name ?? "System"} · {formatDateTime(a.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">No activity yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
