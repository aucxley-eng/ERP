"use client";

import { useActionState } from "react";
import { updateLeadStage, type CrmState } from "../crm-actions";
import { LEAD_STAGES } from "@/lib/crm-constants";

const initial: CrmState = {};

export default function LeadStageSelect({
  leadId,
  stage,
}: {
  leadId: string;
  stage: string;
}) {
  const [state, action, pending] = useActionState(updateLeadStage, initial);

  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="leadId" value={leadId} />
      <select
        name="stage"
        defaultValue={stage}
        disabled={pending}
        className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-brand disabled:opacity-60"
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        disabled={pending}
        className="rounded-md border border-slate-200 px-1.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "…" : "Move"}
      </button>
      {state.error && <span className="text-[10px] text-red-600">{state.error}</span>}
    </form>
  );
}
