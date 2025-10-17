import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VenueProvider } from "@/contexts/VenueContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import PWARegister from "@/components/PWARegister";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
}

export const metadata: Metadata = {
  title: "WhereTonight - Tu plan para esta noche",
  description: "Descubre dónde van los estudiantes esta noche en Varsovia",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon-192.svg",
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WhereTonight",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "WhereTonight",
    description: "Descubre dónde van los estudiantes esta noche en Varsovia",
    siteName: "WhereTonight",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <PWARegister />
        <ErrorBoundary>
          <ToastProvider>
            <LanguageProvider>
              <VenueProvider>
                {children}
              </VenueProvider>
            </LanguageProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
