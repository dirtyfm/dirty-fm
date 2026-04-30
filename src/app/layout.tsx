import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "DirtyFM | Unfiltered Radio, Comedy, Videos & Dirty News",
    template: "%s | DirtyFM"
  },
  description:
    "DirtyFM archives raw internet radio, dark comedy, videos, prank culture, and Dirty News from Erik Woods and Drift."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(214,184,74,0.08),transparent_16rem),radial-gradient(circle_at_85%_20%,rgba(209,42,31,0.12),transparent_14rem),linear-gradient(90deg,rgba(183,178,168,0.03)_50%,transparent_50%)] bg-[length:auto,auto,6px_6px] opacity-50 mix-blend-screen"
          aria-hidden="true"
        />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-[min(calc(100%-2rem),1180px)] flex-1 py-10 min-[760px]:w-[min(calc(100%-4rem),1180px)] min-[760px]:py-20">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
