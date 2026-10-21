"use client";

import { useActionState } from "react";
import { createLead, type CrmState } from "../crm-actions";

const initial: CrmState = {};

export default function NewLeadForm() {
  const [state, action, pending] = useActionState(createLead, initial);

  return (
    <details className="mt-4 rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer p-4 text-sm font-medium text-slate-700">
        + Add a lead manually
      </summary>
      <form action={action} className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          name="notes"
          placeholder="Notes (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-600 sm:col-span-2">Lead added.</p>}
        <button
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
        >
          {pending ? "Adding..." : "Add lead"}
        </button>
      </form>
    </details>
  );
}
