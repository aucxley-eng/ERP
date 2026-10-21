"use client";

import { useActionState } from "react";
import { createInquiry } from "./actions";

type InquiryState = { ok: boolean; error?: string };

const initial: InquiryState = { ok: false };

export default function InquiryForm({
  propertyId,
  defaultName,
  defaultEmail,
}: {
  propertyId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(createInquiry, initial);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Thank you. Your enquiry has been sent to the agent.
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
        placeholder="Phone (optional)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder="I'm interested in this property..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
