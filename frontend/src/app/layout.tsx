import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieNotice from "@/components/CookieNotice";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { buildCanonicalUrl, getSiteName } from "@/lib/seo";

const siteName = getSiteName();
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "O'zbekiston va dunyo bo'ylab dasturchilar uchun hamjamiyat.";
const canonicalUrl = buildCanonicalUrl("/");

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: siteName,
  description: siteDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title: siteName,
    description: siteDescription,
    siteName,
    images: [{ url: buildCanonicalUrl("/globe.svg") }],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: getSiteName(),
  url: buildCanonicalUrl("/"),
  logo: buildCanonicalUrl("/globe.svg"),
  sameAs: [
    "https://t.me/knowhubcommunity",
    "https://github.com/knowhub-dev",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased transition-colors">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <CookieNotice />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Script id="knowhub-organization" type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </Script>
        {measurementId ? <GoogleAnalytics gaId={measurementId} /> : null}
      </body>
    </html>
  );
}
