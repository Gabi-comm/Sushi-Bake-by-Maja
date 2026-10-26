// Single source of truth for the menu. Prices and descriptions are copied from
// Maja's own menu cards; GrabFood prices can differ, so the site says so.

export type SizeId = "regular" | "large" | "family" | "quad";
export type FlavorId = "creamy-kani" | "cheesy-spam" | "california-maki" | "spicy-tuna";

export type TraySize = {
  id: SizeId;
  name: string;
  /** Tray footprint in inches, from Maja's tray-size chart. */
  inches: { length: number; width: number; depth: number };
  pax: string;
  nori: number;
  /** Two-flavor split allowed on this size (+₱100). */
  splitAllowed: boolean;
};

export type LayerKind = "rice" | "filling" | "sauce" | "toppings" | "crust";

export type Layer = { kind: LayerKind; name: string; detail: string };

export type Flavor = {
  id: FlavorId;
  name: string;
  short: string;
  tagline: string;
  description: string;
  bestSeller?: boolean;
  prices: Record<Exclude<SizeId, "quad">, number>;
  /** Accent used for UI chips and the 3D sauce tint. */
  accent: string;
  layers: Layer[];
};

export const SIZES: TraySize[] = [
  { id: "regular", name: "Regular", inches: { length: 6, width: 5, depth: 1.5 }, pax: "1–2", nori: 1, splitAllowed: false },
  { id: "large", name: "Large", inches: { length: 8, width: 6, depth: 1.75 }, pax: "3–4", nori: 2, splitAllowed: true },
  { id: "family", name: "Family", inches: { length: 12, width: 8, depth: 2 }, pax: "5–6", nori: 4, splitAllowed: true },
  { id: "quad", name: "Quad", inches: { length: 14, width: 10, depth: 2.25 }, pax: "8–10", nori: 6, splitAllowed: false },
];

const RICE: Layer = {
  kind: "rice",
  name: "Seasoned sushi rice",
  detail: "Japanese rice seasoned with vinegar and a little sugar. Packed in as the base.",
};

export const FLAVORS: Flavor[] = [
  {
    id: "california-maki",
    name: "California Maki",
    short: "Cali Maki",
    tagline: "The one everyone reorders",
    description:
      "A fresh and flavorful mix of sweet mango, creamy kani, and crisp cucumber over seasoned sushi rice.",
    bestSeller: true,
    prices: { regular: 430, large: 600, family: 1200 },
    accent: "#FFC94A",
    layers: [
      RICE,
      { kind: "filling", name: "Mango · kani · cucumber", detail: "Sweet mango cubes, shredded kani and crisp cucumber." },
      { kind: "sauce", name: "Creamy kani mix", detail: "Kani folded into a rich, creamy sauce." },
      { kind: "toppings", name: "Mayo zig-zag & tobiko", detail: "Japanese mayo drizzle, orange tobiko, sesame and nori strips." },
      { kind: "crust", name: "Baked golden", detail: "Baked until the top caramelizes." },
    ],
  },
  {
    id: "creamy-kani",
    name: "Creamy Kani",
    short: "Kani",
    tagline: "Sweet, tender, golden",
    description:
      "Loaded with sweet and tender kani, blended with a rich creamy sauce, then baked until perfectly golden.",
    prices: { regular: 420, large: 500, family: 1150 },
    accent: "#F4A07A",
    layers: [
      RICE,
      { kind: "filling", name: "Shredded kani", detail: "Generous strands of sweet crab stick." },
      { kind: "sauce", name: "Rich creamy sauce", detail: "Blended through the kani so every bite is creamy." },
      { kind: "toppings", name: "Nori flakes & sesame", detail: "Toasted nori flakes, sesame seeds and tobiko." },
      { kind: "crust", name: "Baked golden", detail: "Baked until perfectly golden." },
    ],
  },
  {
    id: "cheesy-spam",
    name: "Cheesy Spam",
    short: "Spam",
    tagline: "Rich, salty, melty",
    description:
      "Savory Spam layered with creamy sauce and melted cheese for a rich, salty, and satisfying bite.",
    prices: { regular: 400, large: 600, family: 1150 },
    accent: "#F2C14E",
    layers: [
      RICE,
      { kind: "filling", name: "Savory Spam", detail: "Diced Spam, seared for that salty edge." },
      { kind: "sauce", name: "Creamy sauce", detail: "A creamy layer that ties the Spam to the rice." },
      { kind: "toppings", name: "Melted cheese", detail: "A heavy blanket of shredded cheese." },
      { kind: "crust", name: "Baked golden", detail: "Cheese bubbled and browned in the oven." },
    ],
  },
  {
    id: "spicy-tuna",
    name: "Spicy Tuna",
    short: "Tuna",
    tagline: "Bold with just the right heat",
    description:
      "Savory tuna mixed with creamy spicy sauce, giving every bite a bold flavor and just the right amount of heat.",
    prices: { regular: 400, large: 600, family: 1150 },
    accent: "#E2412B",
    layers: [
      RICE,
      { kind: "filling", name: "Savory tuna", detail: "Flaked tuna through the whole tray." },
      { kind: "sauce", name: "Creamy spicy sauce", detail: "Spicy mayo for the heat." },
      { kind: "toppings", name: "Sriracha & mayo lattice", detail: "Criss-crossed sriracha and mayo, sesame and nori." },
      { kind: "crust", name: "Baked golden", detail: "Baked until the lattice sets." },
    ],
  },
];

export const QUAD = {
  id: "quad" as const,
  name: "Quad",
  tagline: "Four favorites, one tray",
  description:
    "Four crowd-favorite flavors in one tray: Creamy Kani, Cheesy Spam, California Maki, and Spicy Tuna. Perfect for sharing.",
  price: 1400,
  /** Quadrant order as laid out in the photo: top-left, top-right, bottom-left, bottom-right. */
  quadrants: ["california-maki", "cheesy-spam", "creamy-kani", "spicy-tuna"] as FlavorId[],
};

export const EXTRAS = {
  noriPack: 40,
  twoFlavorSplit: 100,
};

export const BUSINESS = {
  name: "Sushi Bake by Maja",
  address: "Callisto Tower 2, Theater Dr., W Gala, Makati City 1207",
  phone: "0947 307 8528",
  phoneHref: "tel:+639473078528",
  facebook: "https://www.facebook.com/profile.php?id=61591539816333",
  messenger: "https://m.me/61591539816333",
  grabfood: "https://food.grab.com/ph/en/restaurant/sushi-bake-by-maja-makati-delivery/2-C3CFNXVFTE6HTJ",
  maps: "https://www.google.com/maps/search/?api=1&query=Callisto+Tower+2+Makati",
};

export const TESTIMONIALS = [
  { name: "Rhiyoshie", quote: "Sobrang worth it! Generous sa toppings at hindi tinipid sa ingredients. Highly recommended — babalik-balikan mo talaga!" },
  { name: "Gabriel", quote: "Super sulit and sarap po, worth it balik balikan, would recommend." },
  { name: "Messenger review", quote: "Super sulit!! Pang maramihan yung 4-in-1 nila, na-enjoy namin ng friends ko. Will surely buy again 🥳" },
  { name: "Messenger review", quote: "Warm, creamy, and packed with umami flavor — it captures all the best parts of a sushi roll in a comforting casserole. Surely order again 😊" },
  { name: "Messenger review", quote: "Hello po 😊 we all loved the sushi bakeee. It feels so heavenly." },
];

export const flavorById = (id: FlavorId) => FLAVORS.find((f) => f.id === id)!;
export const sizeById = (id: SizeId) => SIZES.find((s) => s.id === id)!;

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
