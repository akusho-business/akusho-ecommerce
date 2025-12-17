// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

// Providers
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ToastProvider from "@/components/ToastProvider";

// Client Layout (handles Navbar/Footer conditionally)
import ClientLayout from "@/components/ClientLayout";

// Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: {
    default: "AKUSHO | Premium Anime Collectibles",
    template: "%s | AKUSHO",
  },
  description:
    "India's #1 destination for authentic anime figures, collectibles, and merchandise. Shop premium quality figures from One Piece, Naruto, Demon Slayer, and more.",
  keywords: [
    "anime figures",
    "anime collectibles",
    "anime merchandise",
    "anime figures India",
    "One Piece figures",
    "Naruto figures",
    "Demon Slayer figures",
    "Jujutsu Kaisen figures",
    "premium anime figures",
    "authentic anime collectibles",
  ],
  authors: [{ name: "AKUSHO" }],
  creator: "AKUSHO",
  publisher: "AKUSHO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AKUSHO | Premium Anime Collectibles",
    description:
      "India's #1 destination for authentic anime figures, collectibles, and merchandise.",
    url: "/",
    siteName: "AKUSHO",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AKUSHO - Premium Anime Collectibles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AKUSHO | Premium Anime Collectibles",
    description:
      "India's #1 destination for authentic anime figures, collectibles, and merchandise.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased bg-white dark:bg-akusho-deepest text-gray-900 dark:text-white transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {/* Toast Notifications */}
              <ToastProvider />

              {/* Skip to main content (accessibility) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-akusho-neon focus:text-black focus:rounded-lg"
              >
                Skip to main content
              </a>

              {/* 
                ClientLayout handles:
                - Navbar (hidden on admin routes)
                - Footer (hidden on admin routes)
                - AppWrapper with loading screen (hidden on admin routes)
              */}
              <ClientLayout>
                <div id="main-content">
                  {children}
                </div>
              </ClientLayout>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}