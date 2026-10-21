"use client";

import Link from "next/link";
import { useActionState } from "react";
import PasswordInput from "@/components/password-input";
import { authenticate, type AuthState } from "../actions";

const initial: AuthState = {};

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(authenticate, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/dashboard"} />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <PasswordInput name="password" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
