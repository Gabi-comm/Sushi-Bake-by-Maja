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

/**
 * A slow, endless drift of real-table photos. It speeds up while the page scrolls,
 * pauses under the pointer, and can be dragged either way.
 */
export default function Gallery() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

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
        <p className="max-w-xs text-sm text-rice-dim">Every tray goes out sealed, with nori packs and spoons. Drag to look closer.</p>
      </div>

      <div
        ref={track}
        className="flex w-max cursor-grab touch-pan-y select-none gap-4 px-2 active:cursor-grabbing md:gap-6"
        role="list"
        aria-label="Photos of delivered trays"
      >
        {[...PHOTOS, ...PHOTOS].map((p, i) => (
          <figure
            key={i}
            role="listitem"
            aria-hidden={i >= PHOTOS.length || undefined}
            className="group relative aspect-[4/5] w-[72vw] shrink-0 overflow-hidden rounded-[1.6rem] sm:w-[320px]"
          >
            <Image
              src={p.src}
              alt={i < PHOTOS.length ? p.alt : ""}
              fill
              sizes="(min-width: 640px) 320px, 72vw"
              draggable={false}
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-[0.72rem] font-semibold text-white backdrop-blur-md">
              {p.tag}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
