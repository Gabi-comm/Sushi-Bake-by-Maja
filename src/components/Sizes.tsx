"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FLAVORS, QUAD, SIZES, peso, type SizeId } from "@/data/menu";
import { useWebGL } from "@/lib/webgl";
import Reveal from "./Reveal";
import { Arrow } from "./Nav";

const SizeScene = dynamic(() => import("./three/SizeScene"), { ssr: false });

function priceFrom(id: SizeId) {
  if (id === "quad") return QUAD.price;
  return Math.min(...FLAVORS.map((f) => f.prices[id]));
}

function People({ count }: { count: number }) {
  return (
    <span className="flex flex-wrap gap-1" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} viewBox="0 0 20 24" className="h-6 w-5 fill-rice/85" style={{ animation: `fadeUp .5s ${i * 60}ms both` }}>
          <circle cx="10" cy="6" r="5" />
          <path d="M1 24c0-6 4-10 9-10s9 4 9 10z" />
        </svg>
      ))}
    </span>
  );
}

export default function Sizes() {
  const [selected, setSelected] = useState<SizeId>("family");
  const [active, setActive] = useState(false);
  const webgl = useWebGL();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const size = SIZES.find((s) => s.id === selected)!;
  const maxPax = Number(size.pax.split("–")[1]);

  return (
    <section ref={ref} id="sizes" className="relative overflow-hidden py-16 md:py-32" aria-labelledby="sizes-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="text-orange">+</span> Tray sizes
            </p>
            <h2 id="sizes-title" className="display text-[clamp(3rem,7vw,6rem)]">
              Pick your <span className="italic text-orange">tray.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-md text-rice/70 md:justify-self-end">
              From a solo treat to the whole barkada: four foil trays, shown at true size against each other. Tap one to see its
              measurements.
            </p>
          </Reveal>
        </div>

        <div role="tablist" aria-label="Tray size" className="mt-10 grid grid-cols-4 gap-1.5 rounded-full border border-line bg-nori-2/60 p-1.5 md:mx-auto md:max-w-xl">
          {SIZES.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === selected}
              onClick={() => setSelected(s.id)}
              className={`rounded-full py-2.5 text-[0.82rem] font-semibold transition ${
                s.id === selected ? "bg-rice text-nori" : "text-rice/70 hover:text-rice"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="relative -mx-4 mt-2 h-[44vh] min-h-[300px] md:mx-0 md:mt-4 md:h-[56vh]">
          {webgl ? (
            <SizeScene selected={selected} onSelect={setSelected} active={active} />
          ) : (
            <Image src="/img/trays/quad.webp" alt="Sushi bake tray" fill sizes="80vw" className="object-contain p-10" />
          )}
        </div>

        <div key={selected} className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {[
            { label: "Tray", value: `${size.inches.length} × ${size.inches.width} in`, extra: `${size.name} tray` },
            { label: "Good for", value: `${size.pax} pax`, extra: <People count={maxPax} /> },
            { label: "Nori packs", value: `${size.nori} included`, extra: "Extra packs ₱40 each" },
            { label: size.id === "quad" ? "Price" : "From", value: peso(priceFrom(size.id)), extra: size.splitAllowed ? "Two flavors +₱100" : size.id === "quad" ? "All four flavors" : "One flavor" },
          ].map((cell, i) => (
            <div key={cell.label} className="bg-nori-2 p-4 md:p-6" style={{ animation: `fadeUp .6s ${i * 70}ms both` }}>
              <p className="eyebrow">{cell.label}</p>
              <p className="display mt-2 text-[1.55rem] md:text-[2rem]">{cell.value}</p>
              <div className="mt-2 text-xs text-rice-dim md:text-sm">{cell.extra}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={`/order?size=${selected}`} className="btn btn-orange">
            Build a {size.name} tray <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
