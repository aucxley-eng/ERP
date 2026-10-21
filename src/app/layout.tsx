import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import SiteHeader from "@/components/site-header";
import BottomNav from "@/components/bottom-nav";
import FloatingWhatsApp from "@/components/floating-whatsapp";

export const metadata: Metadata = {
  title: {
    default: "ERNT Properties | Land & Property for Sale and Rent in Kenya",
    template: "%s | ERNT Properties",
  },
  description:
    "Browse verified land, commercial plots, houses and apartments for sale and rent across Kenya with ERNT Properties.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <BottomNav signedIn={Boolean(session?.user)} />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
