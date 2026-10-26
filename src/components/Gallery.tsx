"use client";

import Image from "next/image";
import { useRef } from "react";
import Reveal from "./Reveal";

const PHOTOS = [
  { src: "/img/gallery/quad-table.webp", alt: "A Quad tray with six nori packs, spoons and napkins on a woven placemat" },
  { src: "/img/gallery/duo-table.webp", alt: "A two-flavor tray: California Maki and Creamy Kani with three nori packs" },
  { src: "/img/gallery/table-6.webp", alt: "Two trays side by side, Creamy Kani and California Maki, with nori packs" },
  { src: "/img/gallery/regular-table.webp", alt: "A Regular California Maki tray with a nori pack" },
  { src: "/img/gallery/duo-table-2.webp", alt: "A Creamy Kani and California Maki split tray with nori packs" },
  { src: "/img/gallery/table-5.webp", alt: "Two Large trays with four nori packs" },
  { src: "/img/gallery/table-7.webp", alt: "A Large tray topped with mayo, tobiko and nori strips" },
];

export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const endDrag = () => {
    drag.current = null;
    if (track.current) track.current.style.scrollSnapType = "";
  };

  return (
    <section className="py-24 md:py-32" aria-labelledby="gallery-title">
      <div className="mx-auto mb-10 flex max-w-[1400px] items-end justify-between gap-6 px-4 md:px-8">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="text-orange">+</span> Real trays, real tables
          </p>
          <h2 id="gallery-title" className="display text-[clamp(3rem,7vw,6rem)]">
            How it <span className="italic text-orange">arrives.</span>
          </h2>
        </Reveal>
        <div className="hidden gap-2 md:flex">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? "Previous photos" : "Next photos"}
              onClick={() => track.current?.scrollBy({ left: dir * 380, behavior: "smooth" })}
              className="pill grid size-12 place-items-center transition hover:border-orange"
            >
              <svg viewBox="0 0 16 16" className={`size-4 ${dir < 0 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] active:cursor-grabbing md:px-8 [&::-webkit-scrollbar]:hidden"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft };
          track.current.style.scrollSnapType = "none";
        }}
        onPointerMove={(e) => {
          if (drag.current && track.current) track.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {PHOTOS.map((p, i) => (
          <figure
            key={p.src}
            className={`group relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.6rem] sm:w-[340px] ${i % 2 ? "md:mt-12" : ""}`}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 340px, 78vw" draggable={false} className="object-cover transition duration-700 group-hover:scale-105" />
          </figure>
        ))}
      </div>
    </section>
  );
}
