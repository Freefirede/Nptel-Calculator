import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NPTEL Score Calculator",
    template: "%s | NPTEL Score Calculator",
  },
  description:
    "Calculate your NPTEL score, check certificate eligibility, and find out what exam score you need to achieve your target.",
  keywords: ["NPTEL", "score calculator", "certificate", "elite", "gold", "silver"],
  authors: [{ name: "NPTEL Score Calculator" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "NPTEL Score Calculator",
    description:
      "Calculate your NPTEL score, check certificate eligibility, and plan your exam preparation.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Remove the old offline cache so interactive pages always use the current bundle. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(key) {
                        caches.delete(key);
                      });
                    });
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border focus:border-gray-200 focus:rounded focus:text-sm"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
