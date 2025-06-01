import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pnwsauna.com'),
  title: {
    default: "PNW Sauna | Mobile Sauna Rentals & Custom Builds in Coeur d'Alene",
    template: "%s | PNW Sauna",
  },
  description: "Experience authentic Finnish sauna culture with PNW Sauna. We offer mobile sauna rentals, custom sauna building, consultation services, and host public sauna events in Coeur d'Alene, Idaho.",
  keywords: ["sauna", "mobile sauna", "sauna rental", "custom sauna", "Finnish sauna", "Coeur d'Alene", "Idaho", "wellness", "sauna events"],
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
    title: "PNW Sauna | Mobile Sauna Rentals & Custom Builds in Coeur d'Alene",
    description: "Experience authentic Finnish sauna culture with PNW Sauna. Mobile rentals, custom builds, and public events in Coeur d'Alene, Idaho.",
    images: [
      {
        url: "https://pnwsauna.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PNW Sauna - Authentic Finnish Sauna Experience",
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
        <Navigation />
        <main className="min-h-screen">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
