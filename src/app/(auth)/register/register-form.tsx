"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import PasswordInput from "@/components/password-input";
import { register, type AuthState } from "../actions";

const initial: AuthState = {};

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, initial);
  const [role, setRole] = useState("BUYER");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">I want to</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "BUYER", label: "Browse & buy" },
            { value: "AGENT", label: "List properties" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                role === opt.value
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={opt.value}
                checked={role === opt.value}
                onChange={() => setRole(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
        <input
          name="name"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand"
        />
      </div>
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
        <PasswordInput name="password" required minLength={6} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
        <input
          name="phone"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand"
        />
      </div>
      {role === "AGENT" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Company (optional)
          </label>
          <input
            name="company"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
