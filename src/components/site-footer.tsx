import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
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
            <li>+254 700 000 000</li>
            <li>Nairobi, Kenya</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ERNT Properties. All rights reserved.
      </div>
    </footer>
  );
}
