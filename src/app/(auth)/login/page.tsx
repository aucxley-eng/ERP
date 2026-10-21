import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-slate-500">Sign in to manage your listings and enquiries.</p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
