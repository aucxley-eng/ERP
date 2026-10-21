import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BottomNav from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: {
    default: "ERNT Properties | Land & Property for Sale and Rent in Kenya",
    template: "%s | ERNT Properties",
  },
  description:
    "Browse verified land, commercial plots, houses and apartments for sale and rent across Kenya with ERNT Properties.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
