import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/session";
import { DEMO_MODE } from "@/lib/repo";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["600", "700", "800"],
});

const body = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — DayZ, FiveM, Minecraft and Rust servers`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "game server list",
    "DayZ servers",
    "FiveM servers",
    "Minecraft servers",
    "Rust servers",
    "roleplay servers",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — find a server worth joining`,
    description: SITE_DESCRIPTION,
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — find a server worth joining`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0b09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="page">
          <SiteNav user={user} />
          <main className="page__main">{children}</main>
          <SiteFooter demoMode={DEMO_MODE} />
        </div>
      </body>
    </html>
  );
}
