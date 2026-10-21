"use client";

import { useActionState } from "react";
import { updateLead, type CrmState } from "../../crm-actions";

const initial: CrmState = {};

export default function LeadEditForm({
  leadId,
  notes,
  nextFollowUp,
  budgetMin,
  budgetMax,
}: {
  leadId: string;
  notes: string;
  nextFollowUp: string;
  budgetMin: string;
  budgetMax: string;
}) {
  const [state, action, pending] = useActionState(updateLead, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Budget min (KES)
          <input
            name="budgetMin"
            type="number"
            defaultValue={budgetMin}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
          />
        </label>
        <label className="text-xs text-slate-500">
          Budget max (KES)
          <input
            name="budgetMax"
            type="number"
            defaultValue={budgetMax}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
          />
        </label>
      </div>
      <label className="block text-xs text-slate-500">
        Next follow-up
        <input
          name="nextFollowUp"
          type="datetime-local"
          defaultValue={nextFollowUp}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
        />
      </label>
      <label className="block text-xs text-slate-500">
        Notes
        <textarea
          name="notes"
          rows={4}
          defaultValue={notes}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-600">Saved.</p>}
      <button
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
