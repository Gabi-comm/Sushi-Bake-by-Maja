"use client";

import { useEffect } from "react";
import { captureInstallPrompt } from "@/lib/pwa";
import { THEME_COLOR, useTheme } from "@/lib/theme";

/** Registers the service worker, keeps the install prompt, and syncs the browser bar colour. */
export default function PwaRegister() {
  const theme = useTheme();

  useEffect(() => captureInstallPrompt(), []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  return null;
}
