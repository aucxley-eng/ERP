import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [pending, users, published, inquiries] = await Promise.all([
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.inquiry.count(),
  ]);

  const cards = [
    { label: "Pending review", value: pending, href: "/admin/listings?status=PENDING" },
    { label: "Published listings", value: published, href: "/admin/listings?status=PUBLISHED" },
    { label: "Users", value: users, href: "/admin/users" },
    { label: "Total enquiries", value: inquiries, href: "/admin/inquiries" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <p className="mt-1 text-slate-500">Platform overview and moderation.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/listings" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light">
          Moderate listings
        </Link>
        <Link href="/admin/users" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Manage users
        </Link>
        <Link href="/admin/inquiries" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          View enquiries
        </Link>
      </div>
    </div>
  );
}
