"use client";

import { useActionState } from "react";
import { updateViewing, type CrmState } from "../crm-actions";
import { VIEWING_STATUSES } from "@/lib/crm-constants";

const initial: CrmState = {};

export default function ViewingRowActions({
  viewingId,
  status,
  scheduledFor,
}: {
  viewingId: string;
  status: string;
  scheduledFor: string;
}) {
  const [state, action, pending] = useActionState(updateViewing, initial);

  const local = new Date(scheduledFor);
  const localValue = Number.isNaN(local.getTime())
    ? ""
    : new Date(local.getTime() - local.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="viewingId" value={viewingId} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
      >
        {VIEWING_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        name="scheduledFor"
        defaultValue={localValue}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
      />
      <button
        disabled={pending}
        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Update"}
      </button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state.ok && <span className="text-xs text-emerald-600">Saved</span>}
    </form>
  );
}
