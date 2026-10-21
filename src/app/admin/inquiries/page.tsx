import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, slug: true } },
      agent: { select: { name: true } },
    },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">All enquiries</h1>
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{i.name}</p>
                  <p className="text-xs text-slate-500">{i.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{i.property.title}</td>
                <td className="px-4 py-3 text-slate-600">{i.agent.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {i.createdAt.toLocaleDateString("en-KE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inquiries.length && <p className="p-6 text-slate-500">No enquiries yet.</p>}
      </div>
    </div>
  );
}
