import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeadPipeline, getUnreadNotificationCount, type Scope } from "@/lib/crm";
import { leadStageLabel } from "@/lib/crm-constants";
import { formatPrice } from "@/lib/format";
import DashboardNav from "../dashboard-nav";
import LeadStageSelect from "./lead-stage-select";
import NewLeadForm from "./new-lead-form";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const scope: Scope =
    session.user.role === "ADMIN" ? { admin: true } : { agentId: session.user.id };

  const [pipeline, unread] = await Promise.all([
    getLeadPipeline(scope),
    getUnreadNotificationCount(session.user.id),
  ]);

  const total = pipeline.reduce((n, c) => n + c.leads.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <DashboardNav active="/dashboard/leads" unreadCount={unread} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead pipeline</h1>
          <p className="text-slate-500">{total} leads in your pipeline</p>
        </div>
        <Link href="/dashboard/leads/follow-ups" className="text-sm text-brand hover:underline">
          Follow-ups →
        </Link>
      </div>

      <NewLeadForm />

      <div className="mt-6 grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {pipeline.map((col) => (
          <div key={col.stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {leadStageLabel(col.stage)}
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                {col.leads.length}
              </span>
            </div>
            <ul className="space-y-2">
              {col.leads.map((lead) => (
                <li key={lead.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-medium text-slate-900 hover:text-brand"
                  >
                    {lead.name}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{lead.email}</p>
                  {lead.property && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {lead.property.title}
                    </p>
                  )}
                  {lead.budgetMax && (
                    <p className="mt-1 text-xs text-slate-500">
                      up to {formatPrice(lead.budgetMax as unknown as number)}
                    </p>
                  )}
                  <div className="mt-2">
                    <LeadStageSelect leadId={lead.id} stage={lead.stage} />
                  </div>
                </li>
              ))}
              {!col.leads.length && (
                <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  Empty
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
