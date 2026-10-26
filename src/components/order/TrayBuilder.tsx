"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BUSINESS, EXTRAS, FLAVORS, QUAD, SIZES, flavorById, peso, sizeById, type FlavorId, type SizeId } from "@/data/menu";
import { describe, lineTotal, messengerLink, noriCount, orderMessage, orderTotal, type LineItem } from "@/lib/order";
import { onBuilderPreset } from "@/lib/events";
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

/** The chosen tray: real photo cut-outs, split down the middle for two flavors, scaled to size. */
function Preview({ size, flavors }: { size: SizeId; flavors: FlavorId[] }) {
  const s = sizeById(size);
  const scale = 0.55 + (s.inches.length / 14) * 0.45;
  const images = size === "quad" ? ["/img/trays/quad.webp"] : flavors.map((id) => `/img/trays/${id}.webp`);
  return (
    <div className="relative grid aspect-[4/3] place-items-center">
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(232 99 26 / 0.45), transparent 70%)" }}
      />
      <div className="relative aspect-square w-[70%] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `scale(${scale})` }}>
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 90vw"
            className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] transition-all duration-500"
            style={images.length === 2 ? { clipPath: i === 0 ? "polygon(0 0, 52% 0, 48% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 48% 100%)" } : undefined}
          />
        ))}
      </div>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-nori/80 px-3 py-1 text-xs text-rice/80 backdrop-blur">
        {s.name} · {s.inches.length}×{s.inches.width} in · {s.pax} pax
      </p>
    </div>
  );
}

export default function TrayBuilder() {
  const [size, setSize] = useState<SizeId>("large");
  const [flavors, setFlavors] = useState<FlavorId[]>(["california-maki"]);
  const [split, setSplit] = useState(false);
  const [extraNori, setExtraNori] = useState(0);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<LineItem[]>([]);
  const [copied, setCopied] = useState(false);

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

  useEffect(
    () =>
      onBuilderPreset((p) => {
        if (p.flavor) {
          setFlavors([p.flavor]);
          setSplit(false);
          setSize((s) => p.size ?? (s === "quad" ? "large" : s));
        } else if (p.size) {
          setSize(p.size);
          if (!sizeById(p.size).splitAllowed) {
            setSplit(false);
            setFlavors((f) => f.slice(0, 1));
          }
        }
      }),
    [],
  );

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
    <section id="build" className="relative py-24 md:py-32" aria-labelledby="build-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="text-orange">+</span> Build your tray
          </p>
          <h2 id="build-title" className="display max-w-5xl text-balance text-[clamp(3rem,7vw,6rem)]">
            Make it <span className="italic text-orange">yours</span>, then send it.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
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
                            {f.name} {f.bestSeller && <span className="ml-1 rounded bg-mango px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase text-nori">Best</span>}
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
          <div className="rounded-[2rem] border border-line bg-nori-2/70 p-5 md:p-7 lg:sticky lg:top-24 lg:self-start">
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

            <div className="mt-5 flex items-baseline justify-between">
              <p className="eyebrow">{cart.length ? "Order total" : "Total"}</p>
              <p className="display text-4xl text-mango">{peso(total)}</p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
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
            <p className="mt-3 text-center text-xs text-rice-dim" aria-live="polite">
              {copied ? "Order copied. Paste it in the chat if it isn't filled in." : "Prices from our menu; GrabFood prices may vary."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
