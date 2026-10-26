import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { BUSINESS, FLAVORS } from "@/data/menu";
import { INTRO_SCRIPT, THEME_COLOR, THEME_SCRIPT } from "@/lib/theme-shared";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PwaRegister from "@/components/PwaRegister";
import SmoothScroll from "@/components/SmoothScroll";
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
  applicationName: "Sushi Bake by Maja",
  appleWebApp: { capable: true, title: "Sushi Bake", statusBarStyle: "black-translucent" },
  // Set NEXT_PUBLIC_SITE_URL to the real domain on deploy so OG image URLs resolve.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Sushi Bake by Maja — Baked sushi trays in Makati", template: "%s · Sushi Bake by Maja" },
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
  themeColor: THEME_COLOR.light,
  viewportFit: "cover",
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
    // The head script may set data-theme/data-intro before hydration, hence the warning opt-out.
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + INTRO_SCRIPT }} />
      </head>
      <body>
        <SmoothScroll />
        <Nav />
        {children}
        <Footer />
        <PwaRegister />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
