import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "Listings" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/viewings", label: "Viewings" },
  { href: "/dashboard/inquiries", label: "Enquiries" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default function DashboardNav({
  active,
  unreadCount = 0,
}: {
  active: string;
  unreadCount?: number;
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 pb-2">
      {links.map((l) => {
        const isActive = l.href === active;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l.label}
            {l.href === "/dashboard/notifications" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
