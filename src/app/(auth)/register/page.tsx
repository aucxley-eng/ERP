import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-slate-500">
        Buyers browse and save. Agents list and manage properties.
      </p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
