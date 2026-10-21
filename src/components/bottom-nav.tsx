"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
    ),
  },
  {
    href: "/listings?listingType=FOR_SALE",
    label: "Buy",
    match: "/listings",
    icon: <path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-6h4v6" />,
  },
  {
    href: "/listings?listingType=FOR_RENT",
    label: "Rent",
    match: "/listings",
    icon: <path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5" />,
  },
  {
    href: "/listings",
    label: "Search",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Property detail pages render their own sticky action bar at the bottom.
  if (/^\/listings\/[^/]+$/.test(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((it) => {
          const base = it.match ?? it.href.split("?")[0];
          const active = pathname === base;
          return (
            <li key={it.label} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium ${
                  active ? "text-brand" : "text-slate-500"
                }`}
              >
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
