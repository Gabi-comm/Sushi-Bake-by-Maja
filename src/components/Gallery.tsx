"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const PHOTOS = [
  { src: "/img/gallery/quad-table.webp", tag: "Quad · 6 nori", alt: "A Quad tray with six nori packs, spoons and napkins on a woven placemat" },
  { src: "/img/gallery/duo-table.webp", tag: "Cali + Kani split", alt: "A two-flavor tray: California Maki and Creamy Kani with three nori packs" },
  { src: "/img/gallery/table-6.webp", tag: "Kani & Cali", alt: "Two trays side by side, Creamy Kani and California Maki, with nori packs" },
  { src: "/img/gallery/regular-table.webp", tag: "Regular · 1 nori", alt: "A Regular California Maki tray with a nori pack" },
  { src: "/img/gallery/duo-table-2.webp", tag: "Split tray", alt: "A Creamy Kani and California Maki split tray with nori packs" },
  { src: "/img/gallery/table-5.webp", tag: "Two Large", alt: "Two Large trays with four nori packs" },
  { src: "/img/gallery/table-7.webp", tag: "Large · tobiko", alt: "A Large tray topped with mayo, tobiko and nori strips" },
];

const BASE_SPEED = 55; // px per second
const ROLLERS = 14;

/**
 * Trays riding a conveyor belt. The belt runs on its own, speeds up while the page
 * scrolls, pauses under the pointer, and can be dragged either way.
 */
export default function Gallery() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const belt = useRef<HTMLDivElement>(null);
  const rollers = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const row = track.current;
    if (!el || !row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let offset = 0;
    let visible = false;
    let hovering = false;
    let drag: { x: number; offset: number } | null = null;
    let lastScroll = window.scrollY;
    let boost = 0;
    let last = performance.now();
    let frame = 0;

    const paint = () => {
      const loop = row.scrollWidth / 2; // the list is rendered twice
      const x = ((offset % loop) + loop) % loop;
      row.style.transform = `translate3d(${-x}px,0,0)`;
      if (belt.current) belt.current.style.backgroundPositionX = `${-offset}px`;
      rollers.current?.querySelectorAll<HTMLElement>("[data-roller]").forEach((r) => {
        r.style.transform = `rotate(${(offset / 14) * (180 / Math.PI)}deg)`;
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const dy = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      boost += (Math.min(dy * 18, 900) - boost) * 0.08;
      if (!drag && !reduce && visible) {
        const speed = hovering ? 0 : BASE_SPEED + boost;
        offset += speed * dt;
      }
      paint();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, offset };
      row.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) offset = drag.offset - (e.clientX - drag.x);
    };
    const up = () => (drag = null);
    const enter = (e: PointerEvent) => (hovering = e.pointerType === "mouse");
    const leave = () => (hovering = false);
    row.addEventListener("pointerdown", down);
    row.addEventListener("pointermove", move);
    row.addEventListener("pointerup", up);
    row.addEventListener("pointercancel", up);
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      row.removeEventListener("pointerdown", down);
      row.removeEventListener("pointermove", move);
      row.removeEventListener("pointerup", up);
      row.removeEventListener("pointercancel", up);
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section ref={section} className="overflow-hidden py-24 md:py-32" aria-labelledby="gallery-title">
      <div className="mx-auto mb-12 flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-4 md:px-8">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="text-orange">+</span> Real trays, real tables
          </p>
          <h2 id="gallery-title" className="display text-[clamp(3rem,7vw,6rem)]">
            How it <span className="italic text-orange">arrives.</span>
          </h2>
        </Reveal>
        <p className="max-w-xs text-sm text-rice-dim">Fresh off the line: every tray goes out sealed, with nori packs and spoons. Drag the belt to look closer.</p>
      </div>

      <div className="relative">
        {/* Trays riding the belt */}
        <div
          ref={track}
          className="relative z-10 flex w-max cursor-grab touch-pan-y select-none items-end gap-5 px-3 active:cursor-grabbing md:gap-8"
          role="list"
          aria-label="Photos of delivered trays"
        >
          {[...PHOTOS, ...PHOTOS].map((p, i) => (
            <figure
              key={i}
              role="listitem"
              aria-hidden={i >= PHOTOS.length || undefined}
              className="group relative -mb-3 w-[62vw] shrink-0 sm:w-[300px]"
              style={{ transform: `rotate(${i % 3 === 0 ? -1.5 : i % 3 === 1 ? 1 : 0}deg)` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border-[6px] border-paper bg-paper shadow-[0_26px_30px_-18px_rgba(0,0,0,0.7)]">
                <Image
                  src={p.src}
                  alt={i < PHOTOS.length ? p.alt : ""}
                  fill
                  sizes="(min-width: 640px) 300px, 62vw"
                  draggable={false}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              {/* order ticket */}
              <figcaption className="absolute -top-3 left-4 rotate-[-4deg] rounded-sm bg-paper px-2.5 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-ink shadow">
                {p.tag}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Belt, rails and rollers */}
        <div aria-hidden className="relative">
          <div className="h-1.5 bg-gradient-to-b from-[#d7dae0] to-[#8e939b]" />
          <div
            ref={belt}
            className="h-7 bg-[#1c1917] md:h-9"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent 0 22px, rgb(255 255 255 / 0.07) 22px 25px, transparent 25px 28px, rgb(0 0 0 / 0.35) 28px 30px)",
              boxShadow: "inset 0 6px 8px -4px rgb(0 0 0 / 0.6)",
            }}
          />
          <div className="h-1.5 bg-gradient-to-b from-[#8e939b] to-[#5d6168]" />
          <div ref={rollers} className="-mt-3 flex justify-around px-2">
            {Array.from({ length: ROLLERS }, (_, i) => (
              <span key={i} className={`relative size-7 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f1f2f4,#9aa0a8_55%,#5c6168)] md:size-9 ${i % 2 ? "hidden sm:block" : ""}`}>
                <span data-roller className="absolute inset-[22%] rounded-full border-2 border-dashed border-[#4a4e55]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
