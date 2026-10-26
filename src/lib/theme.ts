import { useSyncExternalStore } from "react";

import { THEME_COLOR, THEME_KEY, type Theme } from "./theme-shared";

export { THEME_COLOR, type Theme };

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme() {
  return useSyncExternalStore(subscribe, read, (): Theme => "light");
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.dataset.theme = "dark";
  else delete root.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode: the choice just won't persist.
  }
}
