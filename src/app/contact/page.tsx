import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-2 text-slate-500">
        Questions about a listing or want to sell? Reach out.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Head office</h2>
          <p className="mt-3 text-sm text-slate-500">
            ERNT Properties<br />
            Nairobi, Kenya
          </p>
          <p className="mt-4 text-sm text-slate-700">
            hello@erntproperties.co.ke<br />
            <a href="tel:+254729859685" className="hover:text-brand">
              0729 859685
            </a>
          </p>
          <a
            href="https://wa.me/254729859685"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Chat on WhatsApp
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Listing an agent?</h2>
          <p className="mt-3 text-sm text-slate-500">
            Register as an agent to publish listings, manage enquiries and track
            performance from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
