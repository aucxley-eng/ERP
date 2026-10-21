"use client";

import { useActionState } from "react";
import { requestViewing } from "./actions";

type ViewingState = { ok: boolean; error?: string };

const initial: ViewingState = { ok: false };

export default function ViewingForm({
  propertyId,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  propertyId: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [state, action, pending] = useActionState(requestViewing, initial);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Viewing requested. The agent will confirm your appointment shortly.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input
        name="name"
        required
        defaultValue={defaultName}
        placeholder="Your name"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <input
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
        placeholder="Email address"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <input
        name="phone"
        defaultValue={defaultPhone}
        placeholder="Phone (optional)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <label className="block text-xs font-medium text-slate-500">
        Preferred date &amp; time
      </label>
      <input
        name="scheduledFor"
        type="datetime-local"
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <textarea
        name="notes"
        rows={3}
        placeholder="Anything the agent should know? (optional)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg border border-brand px-4 py-2.5 font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-60"
      >
        {pending ? "Requesting..." : "Book a viewing"}
      </button>
    </form>
  );
}
