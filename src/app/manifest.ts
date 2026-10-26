import type { MetadataRoute } from "next";
import { THEME_COLOR } from "@/lib/theme-shared";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sushi Bake by Maja",
    short_name: "Sushi Bake",
    description: "Baked sushi trays from Makati. Browse the flavors, build a tray and order on Messenger or GrabFood.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: THEME_COLOR.light,
    theme_color: THEME_COLOR.light,
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Build a tray", url: "/order", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Menu", url: "/menu", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
