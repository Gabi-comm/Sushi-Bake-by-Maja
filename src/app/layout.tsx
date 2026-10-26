import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { BUSINESS, FLAVORS } from "@/data/menu";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to the real domain on deploy so OG image URLs resolve.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Sushi Bake by Maja — Baked sushi trays in Makati",
  description:
    "Creamy Kani, Cheesy Spam, California Maki and Spicy Tuna sushi bake trays, made in Makati. Delivery or pick-up, nori included. Order on GrabFood or Messenger.",
  openGraph: {
    title: "Sushi Bake by Maja",
    description: "Generous, golden sushi bake trays from Makati. Order on GrabFood or Messenger.",
    images: [{ url: "/og.jpg", width: 1200, height: 457 }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  servesCuisine: ["Japanese", "Filipino"],
  telephone: "+639473078528",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Callisto Tower 2, Theater Dr., W Gala",
    addressLocality: "Makati City",
    postalCode: "1207",
    addressCountry: "PH",
  },
  sameAs: [BUSINESS.facebook, BUSINESS.grabfood],
  hasMenu: {
    "@type": "Menu",
    hasMenuItem: FLAVORS.map((f) => ({
      "@type": "MenuItem",
      name: f.name,
      description: f.description,
      offers: { "@type": "Offer", price: f.prices.regular, priceCurrency: "PHP" },
    })),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
