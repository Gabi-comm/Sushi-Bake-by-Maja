/** Theme constants safe to import from Server Components (no hooks here). */
export type Theme = "light" | "dark";

export const THEME_KEY = "sbm-theme";
/** Browser chrome colour per theme (address bar, installed-app title bar). */
export const THEME_COLOR: Record<Theme, string> = { light: "#e8631a", dark: "#14110f" };

/**
 * Runs in <head> before first paint so a saved dark preference never flashes orange.
 * Kept as a string because it must not wait for React.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

/**
 * Also pre-paint: picks the home intro before any HTML shows. Loading the home page always
 * gets the full curtain intro ("play"); other pages get "enter", which only matters if the
 * visitor then navigates home. Reduced motion sets nothing. globals.css hides the hero's
 * start states under html[data-intro]; Hero clears the attribute.
 */
export const INTRO_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro=location.pathname==="/"?"play":"enter"}catch(e){}`;
