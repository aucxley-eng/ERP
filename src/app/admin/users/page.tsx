import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { setUserRole } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true, inquiriesRecv: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{u._count.listings}</td>
                <td className="px-4 py-3">
                  <form action={setUserRole} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="BUYER">Buyer</option>
                      <option value="AGENT">Agent</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
