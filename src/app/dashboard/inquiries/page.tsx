import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "../dashboard-nav";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") redirect("/");

  const inquiries = await prisma.inquiry.findMany({
    where: { agentId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, slug: true } } },
  });

  await prisma.inquiry.updateMany({
    where: { agentId: session.user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <DashboardNav active="/dashboard/inquiries" />
      <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
      <p className="mt-1 text-slate-500">Messages from buyers interested in your listings.</p>

      {inquiries.length ? (
        <ul className="mt-8 space-y-4">
          {inquiries.map((inq) => (
            <li key={inq.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{inq.name}</p>
                  <p className="text-sm text-slate-500">
                    {inq.email}
                    {inq.phone ? ` · ${inq.phone}` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {inq.createdAt.toLocaleDateString("en-KE")}
                </span>
              </div>
              <p className="mt-3 text-slate-700">{inq.message}</p>
              <Link
                href={`/listings/${inq.property.slug}`}
                className="mt-3 inline-block text-sm text-brand hover:underline"
              >
                Re: {inq.property.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
          No enquiries yet.
        </p>
      )}
    </div>
  );
}
