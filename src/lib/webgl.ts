import { useSyncExternalStore } from "react";

/** True when the browser can create a WebGL context (false on some old/locked-down phones). */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

let cached: boolean | undefined;
const subscribe = () => () => {};

/** WebGL support, assumed on the server so the 3D markup hydrates consistently. */
export function useWebGL() {
  return useSyncExternalStore(
    subscribe,
    () => (cached ??= hasWebGL()),
    () => true,
  );
}
