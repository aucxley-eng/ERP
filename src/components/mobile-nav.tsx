"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export default function MobileNav({
  links,
  role,
  signedIn,
}: {
  links: NavLink[];
  role?: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        <span className="sr-only">Menu</span>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[6.25rem] z-50 max-h-[calc(100vh-6.25rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-6 pt-2 shadow-lg"
        >
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}

            {signedIn && (role === "AGENT" || role === "ADMIN") && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
            )}
            {signedIn && role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
