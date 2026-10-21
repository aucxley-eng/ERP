import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white md:mt-20">
      {/* Mobile: minimal single strip */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
            ER
          </span>
          <span className="text-sm font-semibold text-slate-900">ERNT Properties</span>
        </Link>
        <div className="flex items-center gap-1">
          <a
            href="tel:+254722704137"
            aria-label="Call us"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
            </svg>
          </a>
          <a
            href="https://wa.me/254722704137"
            aria-label="WhatsApp"
            className="grid h-9 w-9 place-items-center rounded-full text-emerald-600 hover:bg-emerald-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2z" />
            </svg>
          </a>
        </div>
      </div>
      <p className="px-4 pb-4 text-center text-xs text-slate-400 md:hidden">
        © {new Date().getFullYear()} ERNT Properties
      </p>

      {/* Desktop: full columns */}
      <div className="mx-auto hidden max-w-6xl gap-8 px-4 py-12 md:grid md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
              ER
            </span>
            <span className="font-semibold text-slate-900">ERNT Properties</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Verified land and property across Kenya. Buy, sell and rent with confidence.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/listings" className="hover:text-brand">All properties</Link></li>
            <li><Link href="/listings?listingType=FOR_SALE" className="hover:text-brand">For sale</Link></li>
            <li><Link href="/listings?listingType=FOR_RENT" className="hover:text-brand">For rent</Link></li>
            <li><Link href="/listings?propertyType=COMMERCIAL_LAND" className="hover:text-brand">Commercial land</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-brand">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
            <li><Link href="/register" className="hover:text-brand">List a property</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>hello@erntproperties.co.ke</li>
            <li>
              <a href="tel:+254722704137" className="hover:text-brand">
                0722 704137
              </a>
            </li>
            <li>
              <a href="https://wa.me/254722704137" className="hover:text-brand">
                WhatsApp
              </a>
            </li>
            <li>Nairobi, Kenya</li>
          </ul>
        </div>
      </div>
      <div className="hidden border-t border-slate-200 py-4 text-center text-xs text-slate-400 md:block">
        © {new Date().getFullYear()} ERNT Properties. All rights reserved.
      </div>
    </footer>
  );
}
