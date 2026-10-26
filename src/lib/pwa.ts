import { useSyncExternalStore } from "react";

/** Chrome/Android's install event (not in the TS DOM lib). */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export type InstallState = "installed" | "prompt" | "ios" | "manual";

let deferred: InstallEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Called once from PwaRegister: keep Chrome's install prompt for our own button. */
export function captureInstallPrompt() {
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    emit();
  };
  const onInstalled = () => {
    installed = true;
    deferred = null;
    emit();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function snapshot(): InstallState {
  if (installed || isStandalone()) return "installed";
  if (deferred) return "prompt";
  return isIOS() ? "ios" : "manual";
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** "installed" on the server so no install UI renders before we know. */
export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, (): InstallState => "installed");
}

/** Shows Chrome's native install sheet; false if it isn't available. */
export async function promptInstall() {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  if (outcome === "accepted") installed = true;
  emit();
  return true;
}
