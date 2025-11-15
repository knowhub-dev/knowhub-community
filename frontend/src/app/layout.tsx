import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { buildMetadata, buildCanonicalUrl, getSiteName } from "@/lib/seo";

export const metadata: Metadata = buildMetadata();

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
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Script id="knowhub-organization" type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </Script>
      </body>
    </html>
  );
}
