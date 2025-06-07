import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StripeProvider from "@/components/StripeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pnwsauna.com'),
  title: {
    default: "PNW Sauna | Sauna Sessions & Memberships at Atlas Waterfront Park, Coeur d'Alene",
    template: "%s | PNW Sauna",
  },
  description: "Experience authentic Finnish sauna culture at PNW Sauna's Atlas Waterfront Park location in Coeur d'Alene, Idaho. We offer sauna sessions, community memberships, custom sauna building, and wellness events.",
  keywords: ["sauna", "sauna sessions", "sauna membership", "custom sauna", "Finnish sauna", "Atlas Waterfront Park", "Coeur d'Alene", "Idaho", "wellness", "sauna community"],
  authors: [{ name: "PNW Sauna" }],
  creator: "PNW Sauna",
  publisher: "PNW Sauna",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pnwsauna.com/",
    siteName: "PNW Sauna",
    title: "PNW Sauna | Sauna Sessions & Memberships at Atlas Waterfront Park, Coeur d'Alene",
    description: "Experience authentic Finnish sauna culture at Atlas Waterfront Park in Coeur d'Alene, Idaho. Sauna sessions, memberships, and custom builds.",
    images: [
      {
        url: "https://pnwsauna.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PNW Sauna - Authentic Finnish Sauna Experience at Atlas Waterfront Park",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pnwsauna",
    creator: "@pnwsauna",
  },
  alternates: {
    canonical: "https://pnwsauna.com",
  },
  other: {
    "facebook-domain-verification": "", // Add your Facebook domain verification code if you have one
    "facebook:pages": "61574777797399",
    "og:see_also": [
      "https://www.facebook.com/profile.php?id=61574777797399",
      "https://www.instagram.com/pnw_sauna_cda"
    ],
  },
  verification: {
    other: {
      "facebook-domain-verification": "", // Add your Facebook domain verification code if you have one
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StripeProvider>
          <Navigation />
          <main className="min-h-screen">
          {children}
          </main>
          <Footer />
        </StripeProvider>
      </body>
    </html>
  );
}
