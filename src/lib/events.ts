import { scrollToY } from "@/components/SmoothScroll";
import type { FlavorId, SizeId } from "@/data/menu";

/** Other sections ask the tray builder to preselect something and scroll to it. */
export type BuilderPreset = { flavor?: FlavorId; size?: SizeId };

const EVENT = "sbm:builder-preset";

export function presetBuilder(preset: BuilderPreset) {
  window.dispatchEvent(new CustomEvent<BuilderPreset>(EVENT, { detail: preset }));
  const el = document.getElementById("build");
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40);
}

export function onBuilderPreset(handler: (preset: BuilderPreset) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<BuilderPreset>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
