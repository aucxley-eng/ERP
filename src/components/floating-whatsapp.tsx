"use client";

import { usePathname } from "next/navigation";

const PHONE = "254729859685";
const MESSAGE = encodeURIComponent(
  "Hi ERNT Properties, I'm interested in a property on your website.",
);

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  // Property detail pages have their own sticky contact bar.
  if (/^\/listings\/[^/]+$/.test(pathname)) return null;

  return (
    <a
      href={`https://wa.me/${PHONE}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 md:bottom-6"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2z" />
      </svg>
    </a>
  );
}
