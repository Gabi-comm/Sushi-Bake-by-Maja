"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BUSINESS, EXTRAS, FLAVORS, QUAD, SIZES, flavorById, peso, sizeById, type FlavorId, type SizeId } from "@/data/menu";
import { describe, lineTotal, messengerLink, noriCount, orderMessage, orderTotal, type BuilderStart, type LineItem } from "@/lib/order";
import { useWebGL } from "@/lib/webgl";
import Reveal from "../Reveal";
import { Arrow } from "../Nav";

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-nori/60 px-4 py-3">
      <span className="text-sm text-rice/80">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-9 place-items-center rounded-full border border-line text-lg transition hover:border-orange disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          onClick={() => onChange(value + 1)}
          className="grid size-9 place-items-center rounded-full border border-line text-lg transition hover:border-orange"
        >
          +
        </button>
      </div>
    </div>
  );
}

const BuilderScene = dynamic(() => import("../three/BuilderScene"), { ssr: false });

/** Flat top-down fallback for phones without WebGL: the baked tops, split down the middle. */
function FlatTray({ size, flavors }: { size: SizeId; flavors: FlavorId[] }) {
  const s = sizeById(size);
  const tops = size === "quad" ? ["/tex/quad.webp"] : flavors.map((id) => `/tex/${id}.webp`);
  return (
    <div
      className="relative overflow-hidden rounded-[14%/18%] border-[6px] border-[#d9dce1] shadow-[0_30px_50px_-20px_rgba(0,0,0,0.6)]"
      style={{ width: `${40 + (s.inches.length / 14) * 45}%`, aspectRatio: `${s.inches.length} / ${s.inches.width}` }}
    >
      {tops.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="40vw"
          className="object-cover"
          style={tops.length === 2 ? { clipPath: i === 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" } : undefined}
        />
      ))}
    </div>
  );
}

/** The chosen tray in 3D (same foil model and true scale as the size lineup). */
function Preview({ size, flavors }: { size: SizeId; flavors: FlavorId[] }) {
  const s = sizeById(size);
  const webgl = useWebGL();
  return (
    <div className="relative grid aspect-[16/10] place-items-center lg:aspect-[4/3]">
      <div aria-hidden className="absolute inset-[10%] rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.45), transparent 70%)" }} />
      {webgl ? (
        <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
          <BuilderScene size={size} flavors={flavors} />
        </div>
      ) : (
        <FlatTray size={size} flavors={flavors} />
      )}
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-nori/80 px-3 py-1 text-xs text-rice/80 backdrop-blur">
        {s.name} · {s.inches.length}×{s.inches.width} in · {s.pax} pax
      </p>
    </div>
  );
}

export default function TrayBuilder({ start = { size: "large" } }: { start?: BuilderStart }) {
  const [size, setSize] = useState<SizeId>(start.size);
  const [flavors, setFlavors] = useState<FlavorId[]>([start.flavor ?? "california-maki"]);
  const [split, setSplit] = useState(false);
  const [extraNori, setExtraNori] = useState(0);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<LineItem[]>([]);
  const [copied, setCopied] = useState(false);
  const section = useRef<HTMLElement>(null);
  const [barOn, setBarOn] = useState(true);

  // The phone bar slides away once the builder scrolls out (so it never covers the footer).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarOn(e.isIntersecting), { rootMargin: "0px 0px -120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sizeInfo = sizeById(size);
  const canSplit = sizeInfo.splitAllowed;

  // A split only exists on Large/Family; drop the second flavor otherwise.
  const chooseSize = (id: SizeId) => {
    setSize(id);
    if (!sizeById(id).splitAllowed) {
      setSplit(false);
      setFlavors((f) => f.slice(0, 1));
    }
  };

  const toggleFlavor = (id: FlavorId) => {
    setFlavors((cur) => {
      if (!split) return [id];
      if (cur.includes(id)) return cur.length > 1 ? cur.filter((f) => f !== id) : cur;
      return cur.length < 2 ? [...cur, id] : [cur[1], id];
    });
  };

  const current: LineItem = { size, flavors: size === "quad" ? [] : flavors, extraNori, qty };
  const ready = size === "quad" || (split ? flavors.length === 2 : flavors.length === 1);
  const currentTotal = ready ? lineTotal(current) : null;
  const items = cart.length ? cart : ready ? [current] : [];
  const total = items.length ? orderTotal(items) : 0;

  const addToCart = () => {
    if (!ready) return;
    setCart((c) => [...c, current]);
    setExtraNori(0);
    setQty(1);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage(items));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section ref={section} id="build" className="relative pb-36 pt-28 md:pb-32 md:pt-40" aria-labelledby="build-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="text-orange">+</span> Build your tray
          </p>
          <h1 id="build-title" className="display max-w-5xl text-balance text-[clamp(3rem,7vw,6rem)]">
            Make it <span className="italic text-orange">yours</span>, then send it.
          </h1>
        </Reveal>

        <div className="mt-8 grid gap-8 md:mt-12 lg:grid-cols-[1.05fr_1fr]">
          {/* Choices */}
          <div className="space-y-8">
            <fieldset>
              <legend className="eyebrow mb-3">1 · Size</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === size}
                    onClick={() => chooseSize(s.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      s.id === size ? "border-orange bg-orange/10" : "border-line hover:border-rice/30"
                    }`}
                  >
                    <span className="display block text-2xl">{s.name}</span>
                    <span className="mt-1 block text-xs text-rice-dim">
                      {s.pax} pax · {s.nori} nori
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset disabled={size === "quad"} className="disabled:opacity-100">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <legend className="eyebrow">2 · Flavor{split ? "s (pick two)" : ""}</legend>
                {size !== "quad" && (
                  <label className={`flex items-center gap-2 text-xs ${canSplit ? "text-rice/80" : "text-rice/35"}`}>
                    <input
                      type="checkbox"
                      checked={split}
                      disabled={!canSplit}
                      onChange={(e) => {
                        setSplit(e.target.checked);
                        if (!e.target.checked) setFlavors((f) => f.slice(0, 1));
                      }}
                      className="size-4 accent-[#e8631a]"
                    />
                    Two flavors (+{peso(EXTRAS.twoFlavorSplit)}){!canSplit && " · Large & Family only"}
                  </label>
                )}
              </div>
              {size === "quad" ? (
                <p className="rounded-2xl border border-line bg-nori-2 p-4 text-sm text-rice/80">
                  The Quad comes with all four: {QUAD.quadrants.map((id) => flavorById(id).name).join(", ")}.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {FLAVORS.map((f) => {
                    const on = flavors.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleFlavor(f.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          on ? "border-orange bg-orange/10" : "border-line hover:border-rice/30"
                        }`}
                      >
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                          <Image src={`/tex/${f.id}.webp`} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">
                            {f.name} {f.bestSeller && <span className="ml-1 rounded bg-mango px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase text-on-accent">Best</span>}
                          </span>
                          <span className="text-xs text-rice-dim">{peso(f.prices[size as Exclude<SizeId, "quad">])}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="eyebrow mb-3">3 · Extras</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <Stepper label={`Extra nori (${peso(EXTRAS.noriPack)})`} value={extraNori} min={0} onChange={setExtraNori} />
                <Stepper label="Trays" value={qty} min={1} onChange={setQty} />
              </div>
            </fieldset>
          </div>

          {/* Preview + summary */}
          {/* On phones this card comes first, so the tray is seen while choosing. */}
          <div className="order-first rounded-[2rem] border border-line bg-nori-2/70 p-4 md:p-7 lg:order-none lg:sticky lg:top-24 lg:self-start">
            <Preview size={size} flavors={size === "quad" ? [] : flavors} />

            <div className="mt-4 flex items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-sm text-rice-dim">This tray</p>
                <p className="font-semibold">
                  {ready ? describe(current).split(" — ")[0] : split ? "Pick a second flavor" : "Pick a flavor"}
                </p>
                {ready && <p className="text-xs text-rice-dim">{noriCount(current)} nori packs total</p>}
              </div>
              <div className="text-right">
                <p className="display text-3xl">{currentTotal !== null ? peso(currentTotal) : "—"}</p>
                <button type="button" onClick={addToCart} disabled={!ready} className="mt-1 text-xs font-semibold text-orange underline-offset-4 hover:underline disabled:opacity-40">
                  {cart.length ? "+ Add this tray to order" : "+ Add, then build another"}
                </button>
              </div>
            </div>

            {cart.length > 0 && (
              <ul className="mt-4 space-y-2" aria-label="Your order">
                {cart.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-rice/85">{describe(item)}</span>
                    <button type="button" onClick={() => setCart((c) => c.filter((_, j) => j !== i))} className="text-xs text-rice-dim hover:text-sriracha" aria-label={`Remove ${describe(item)}`}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 hidden items-baseline justify-between lg:flex">
              <p className="eyebrow">{cart.length ? "Order total" : "Total"}</p>
              <p className="display text-4xl text-orange">{peso(total)}</p>
            </div>

            <div className="mt-5 hidden gap-2 sm:grid-cols-2 lg:grid">
              <a
                href={items.length ? messengerLink(items) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={copy}
                aria-disabled={!items.length}
                className={`btn btn-orange justify-center ${items.length ? "" : "pointer-events-none opacity-40"}`}
              >
                Send on Messenger <Arrow />
              </a>
              <a href={BUSINESS.grabfood} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-center">
                Order on GrabFood
              </a>
            </div>
            <p className="mt-3 text-center text-xs text-rice-dim max-lg:mb-1" aria-live="polite">
              {copied ? "Order copied. Paste it in the chat if it isn't filled in." : "Prices from our menu; GrabFood prices may vary."}
            </p>
            <a href={BUSINESS.grabfood} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3 w-full justify-center lg:hidden">
              Or order on GrabFood
            </a>
          </div>
        </div>
      </div>

      {/* Phones: total and send always in reach while scrolling the choices. */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-nori/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 lg:hidden ${barOn ? "" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-rice-dim">{cart.length ? `Order · ${cart.length} trays` : "Total"}</p>
            <p className="display text-3xl leading-none">{peso(total)}</p>
          </div>
          <a
            href={items.length ? messengerLink(items) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={copy}
            aria-disabled={!items.length}
            className={`btn btn-orange shrink-0 ${items.length ? "" : "pointer-events-none opacity-40"}`}
          >
            Send on Messenger <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
