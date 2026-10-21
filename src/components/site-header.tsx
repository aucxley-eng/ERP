import Link from "next/link";
import { auth, signOut } from "@/auth";
import MobileNav from "@/components/mobile-nav";

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
              <MobileNav
                links={NAV_LINKS}
                role={role}
                signedIn={true}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-light sm:px-4"
              >
                List a property
              </Link>
              <MobileNav
                links={NAV_LINKS}
                signedIn={false}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
