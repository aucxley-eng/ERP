import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">About ERNT Properties</h1>
      <p className="mt-4 text-lg text-slate-600">
        ERNT Properties connects buyers, sellers and tenants with verified land and
        property across Kenya. We focus on transparent listings, clear ownership
        documents and responsive service.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Verified listings", body: "Every plot is checked before it goes live." },
          { title: "Ready titles", body: "Clear title deed options on land listings." },
          { title: "Local expertise", body: "Deep knowledge of Nairobi metro and beyond." },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
