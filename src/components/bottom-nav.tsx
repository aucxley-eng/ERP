"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PHONE = "254729859685";
const MESSAGE = encodeURIComponent(
  "Hi ERNT Properties, I'm interested in a property on your website.",
);

export default function BottomNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();

  // Property detail pages render their own sticky action bar at the bottom.
  if (/^\/listings\/[^/]+$/.test(pathname)) return null;

  const accountHref = signedIn ? "/account/viewings" : "/login";

  const items = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
    },
    {
      href: "/listings",
      label: "Browse",
      active: pathname === "/listings",
      icon: (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </>
      ),
    },
    {
      href: `https://wa.me/${PHONE}?text=${MESSAGE}`,
      label: "WhatsApp",
      external: true,
      icon: <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2z" />,
    },
    {
      href: accountHref,
      label: "Account",
      active: pathname.startsWith("/account"),
      icon: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
        </>
      ),
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
      icon: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-5M12 8h.01" />
        </>
      ),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((it) => {
          const cls = `flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium ${
            it.active ? "text-brand" : "text-slate-500"
          }`;
          return (
            <li key={it.label} className="flex-1">
              {it.external ? (
                <a href={it.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    {it.icon}
                  </svg>
                  {it.label}
                </a>
              ) : (
                <Link href={it.href} className={cls}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {it.icon}
                  </svg>
                  {it.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
