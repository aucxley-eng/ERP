"use client";

import { useState } from "react";

export default function PasswordInput({
  name,
  required,
  minLength,
}: {
  name: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 outline-none focus:border-brand"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
      >
        {show ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a15.5 15.5 0 0 1-3.3 4.3M6.6 6.6A15.5 15.5 0 0 0 2 12s3 8 10 8a9.1 9.1 0 0 0 4-.9" />
            <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
            <path d="M2 2l20 20" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
