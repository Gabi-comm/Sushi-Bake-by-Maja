"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FLAVORS, QUAD, flavorById, peso, type FlavorId } from "@/data/menu";
import { useWebGL } from "@/lib/webgl";
import { smoothstep } from "./three/geometry";
import type { SceneItem } from "./three/LayerScene";
import { scrollToY } from "./SmoothScroll";
import { Arrow } from "./Nav";

gsap.registerPlugin(ScrollTrigger);

const LayerScene = dynamic(() => import("./three/LayerScene"), { ssr: false });

const ITEMS: SceneItem[] = [...FLAVORS.map((f) => f.id), "quad"];

function itemInfo(item: SceneItem) {
  if (item === "quad") {
    return {
      name: QUAD.name,
      tagline: QUAD.tagline,
      description: QUAD.description,
      prices: [{ label: "Quad · 8–10 pax", price: QUAD.price }],
      layers: QUAD.quadrants.map((id) => flavorById(id).name),
      bestSeller: false,
      image: "/img/trays/quad.webp",
    };
  }
  const f = flavorById(item);
  return {
    name: f.name,
    tagline: f.tagline,
    description: f.description,
    prices: [
      { label: "Regular", price: f.prices.regular },
      { label: "Large", price: f.prices.large },
      { label: "Family", price: f.prices.family },
    ],
    layers: f.layers.map((l) => l.name),
    bestSeller: !!f.bestSeller,
    image: `/img/trays/${f.id}.webp`,
  };
}

export default function Flavors() {
  const section = useRef<HTMLElement>(null);
  const explode = useRef(0);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const webgl = useWebGL();
  const [layerStep, setLayerStep] = useState(-1);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const pos = self.progress * ITEMS.length;
        const i = Math.min(ITEMS.length - 1, Math.floor(pos));
        const s = pos - i;
        // assemble → peel apart → hold → close back up before the next flavor
        const last = i === ITEMS.length - 1;
        explode.current = smoothstep(0.1, 0.42, s) * (last ? 1 : 1 - smoothstep(0.8, 0.97, s));
        setIndex(i);
        setLayerStep(explode.current > 0.5 ? Math.min(4, Math.floor((s - 0.4) / 0.08)) : -1);
      },
    });
    // keep the 3D running a little before/after the pinned range
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => {
      trigger.kill();
      io.disconnect();
    };
  }, []);

  const jumpTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    scrollToY(top + ((i + 0.5) / ITEMS.length) * span);
  };

  const item = ITEMS[index];
  const info = itemInfo(item);

  return (
    <section ref={section} id="flavors" className="relative" style={{ height: `${ITEMS.length * 110 + 100}vh` }} aria-label="Flavors">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-1/2 -z-0 aspect-square w-[min(110vw,1000px)] -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.35), transparent 65%)" }}
        />

        {/* 3D */}
        <div className="absolute inset-x-0 top-[13%] h-[52%] md:inset-y-0 md:left-[30%] md:right-0 md:top-0 md:h-full">
          {webgl ? (
            <LayerScene item={item} explode={explode} active={inView} />
          ) : (
            <div className="relative h-full w-full">
              <Image src={info.image} alt={`${info.name} sushi bake`} fill sizes="60vw" className="object-contain p-8" />
            </div>
          )}
        </div>

        {/* Copy */}
        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1400px] flex-col justify-between px-4 pb-6 pt-24 md:justify-center md:px-8 md:pb-0 md:pt-0">
          <div className="pointer-events-auto">
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="text-orange">+</span> The menu, layer by layer
            </p>
            <div role="tablist" aria-label="Choose a flavor" className="flex flex-wrap gap-1.5">
              {ITEMS.map((it, i) => (
                <button
                  key={it}
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => jumpTo(i)}
                  className={`rounded-full border px-3.5 py-1.5 text-[0.78rem] font-semibold transition ${
                    i === index ? "border-orange bg-orange text-on-accent" : "border-line text-rice/70 hover:text-rice"
                  }`}
                >
                  {it === "quad" ? "Quad" : flavorById(it as FlavorId).short}
                </button>
              ))}
            </div>
          </div>

          <div key={item} className="pointer-events-auto max-w-[420px] animate-[fadeUp_0.7s_cubic-bezier(.2,.8,.2,1)] md:mt-10">
            {info.bestSeller && (
              <span className="mb-3 inline-block -rotate-3 rounded-md bg-mango px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-widest text-on-accent">
                Best seller
              </span>
            )}
            <h2 className="display text-[clamp(2.8rem,6vw,5.2rem)]">
              {info.name.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic text-orange">{info.name.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-2 text-sm uppercase tracking-[0.16em] text-rice-dim">{info.tagline}</p>
            <ol className="mt-4 flex flex-wrap gap-1.5 md:hidden" aria-label="Layers">
              {info.layers.map((name, i) => (
                <li
                  key={name}
                  className={`rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors duration-500 ${
                    layerStep >= i || item === "quad" ? "border-orange/60 text-rice" : "border-line text-rice/35"
                  }`}
                >
                  {name}
                </li>
              ))}
            </ol>
            <p className="mt-4 hidden text-[0.95rem] leading-relaxed text-rice/75 md:block">{info.description}</p>

            <ol className="mt-5 hidden space-y-1.5 md:block">
              {info.layers.map((name, i) => (
                <li
                  key={name}
                  className={`flex items-center gap-3 text-sm transition-colors duration-500 ${
                    layerStep >= i || item === "quad" ? "text-rice" : "text-rice/35"
                  }`}
                >
                  <span className="w-5 font-mono text-[0.7rem] text-orange">{String(i + 1).padStart(2, "0")}</span>
                  {name}
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              {info.prices.map((p) => (
                <span key={p.label} className="rounded-full border border-line bg-nori-2/70 px-3 py-1.5 text-[0.78rem]">
                  <span className="text-rice-dim">{p.label}</span> <span className="font-bold">{peso(p.price)}</span>
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <Link href={item === "quad" ? "/order?size=quad" : `/order?flavor=${item}`} className="btn btn-orange">
                Add to my tray <Arrow />
              </Link>
              <span className="hidden text-xs text-rice-dim md:inline">Drag the tray to turn it</span>
            </div>
          </div>
        </div>

        {/* progress */}
        <div className="absolute bottom-6 right-4 hidden items-center gap-3 md:right-8 md:flex" aria-hidden>
          <span className="display text-3xl">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-sm text-rice-dim">/ {String(ITEMS.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
