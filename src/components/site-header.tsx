import Link from "next/link";
import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import HeaderSearch from "@/components/header-search";

const NAV_LINKS = [
  { href: "/listings", label: "Properties" },
  { href: "/listings?listingType=FOR_SALE", label: "Buy" },
  { href: "/listings?listingType=FOR_RENT", label: "Rent" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            ER
          </span>
          <span className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            ERNT <span className="text-brand">Properties</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {session?.user ? (
            <>
              {(role === "AGENT" || role === "ADMIN") && (
                <Link
                  href="/dashboard"
                  className="hidden rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 sm:block"
                >
                  Dashboard
                </Link>
              )}
              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 sm:block"
                >
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 sm:block"
              >
                Log in
              </Link>
              <a
                href="tel:+254729859685"
                aria-label="Call us"
                className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 sm:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
                </svg>
              </a>
              <Link
                href="/register"
                className="rounded-full bg-brand px-4 py-2 font-medium text-white hover:bg-brand-light"
              >
                <span className="hidden sm:inline">List a property</span>
                <span className="sm:hidden">Sell</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <Suspense
        fallback={<div className="mx-auto max-w-6xl px-4 pb-2.5" aria-hidden><div className="h-9" /></div>}
      >
        <HeaderSearch />
      </Suspense>
    </header>
  );
}
