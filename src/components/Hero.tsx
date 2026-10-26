"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { BUSINESS, FLAVORS } from "@/data/menu";
import { Arrow } from "./Nav";

// Sesame seeds drifting around the tray: [left %, top %, size px, rotation deg, delay s]
const SEEDS = [
  [18, 30, 9, 20, 0], [30, 72, 7, -30, 1.2], [44, 18, 6, 60, 0.4], [62, 82, 8, 10, 2],
  [74, 22, 7, -50, 0.8], [86, 64, 9, 35, 1.6], [54, 52, 5, -10, 2.4], [24, 52, 6, 80, 3],
] as const;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const tray = useRef<HTMLDivElement>(null);

  // Intro: orange curtain with the mayo zig-zag drawing on, then the tray drops in.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(".intro-curtain", { display: "none" });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(".intro-drizzle", { strokeDashoffset: 1400 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .fromTo(".intro-word", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.08 }, 0.15)
        .to(".intro-curtain", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=0.25")
        .from(".hero-line", { yPercent: 105, duration: 1.2, stagger: 0.1 }, "-=0.55")
        .from(tray.current, { y: -120, rotate: -38, scale: 1.25, opacity: 0, duration: 1.6 }, "<0.05")
        .from(".hero-fade", { opacity: 0, y: 24, duration: 1, stagger: 0.08 }, "-=1.1");
    }, root);
    return () => ctx.revert();
  }, []);

  // Pointer parallax: tray tilts towards the cursor, seeds drift the other way.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden pt-28 md:h-[100svh] md:min-h-[680px] md:pt-28"
      style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
    >
      {/* Intro curtain */}
      <div className="intro-curtain fixed inset-0 z-[70] grid place-items-center bg-orange text-nori" aria-hidden>
        <div className="relative text-center">
          <svg viewBox="0 0 700 120" className="absolute -top-16 left-1/2 w-[min(90vw,700px)] -translate-x-1/2" fill="none">
            <path
              className="intro-drizzle"
              d="M10 90 C60 10 90 10 120 80 S180 120 210 40 S270 0 300 80 S360 120 390 40 S450 0 480 80 S540 120 570 40 S640 10 690 70"
              stroke="#F6EFE4"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="1400"
            />
          </svg>
          <p className="display overflow-hidden text-[clamp(3rem,10vw,7rem)]">
            <span className="intro-word inline-block">Sushi</span>{" "}
            <span className="intro-word inline-block italic">Bake</span>
          </p>
          <p className="overflow-hidden text-sm font-bold uppercase tracking-[0.35em]">
            <span className="intro-word inline-block">by Maja · Makati</span>
          </p>
        </div>
      </div>

      {/* Warm glow behind the tray */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[55%] -z-10 aspect-square w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(232 99 26 / 0.55), rgb(232 99 26 / 0.08) 45%, transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-[1400px] px-4 md:h-full md:px-8">
        {/* Headline sits under the tray, like the wake under the yacht */}
        <h1 className="display relative z-10 select-none text-[clamp(4.4rem,15.5vw,15rem)] uppercase text-rice">
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="hero-line block">Sushi,</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em] md:pl-[3vw]">
            <span className="hero-line block">
              <span className="italic normal-case text-orange">baked</span>
              <span className="text-[0.5em] align-top"> .</span>
            </span>
          </span>
        </h1>

        {/* The Quad tray, cut out from Maja's own photo */}
        <div
          ref={tray}
          className="pointer-events-none absolute left-1/2 top-[118px] z-20 w-[min(86vw,560px)] -translate-x-[46%] md:top-[8%] md:w-[min(40vw,600px)] md:-translate-x-[40%]"
        >
          <div
            className="transition-transform duration-700 ease-out"
            style={{ transform: "translate3d(calc(var(--px) * 26px), calc(var(--py) * 20px), 0) rotate(calc(6deg + var(--px) * 5deg))" }}
          >
            <div className="[animation:float_7s_ease-in-out_infinite]">
              <Image
                src="/img/trays/quad.webp"
                alt="A Quad tray: California Maki, Cheesy Spam, Creamy Kani and Spicy Tuna sushi bake in one foil tray"
                width={1000}
                height={894}
                priority
                sizes="(min-width: 768px) 58vw, 92vw"
                className="h-auto w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.65)]"
              />
            </div>
            {/* steam */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="absolute top-[30%] size-24 rounded-full bg-rice/25 blur-2xl"
                style={{ left: `${30 + i * 18}%`, animation: `steam 5s ${i * 1.4}s ease-out infinite` }}
              />
            ))}
          </div>
        </div>

        {SEEDS.map(([left, top, size, rot, delay], i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute z-30 rounded-[50%] bg-[#efe3c6] shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.25)]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size * 0.55,
              transform: `translate3d(calc(var(--px) * ${-30 - i * 6}px), calc(var(--py) * ${-24 - i * 4}px), 0) rotate(${rot}deg)`,
              animation: `float ${6 + i}s ${delay}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Bottom row: video pill + pitch cluster */}
        <div className="relative z-30 mt-[min(84vw,520px)] grid gap-10 pb-16 md:absolute md:inset-x-8 md:bottom-10 md:mt-0 md:grid-cols-[1fr_minmax(0,340px)] md:items-end md:pb-0">
          <a href="#flavors" className="hero-fade group hidden items-center gap-4 self-end md:flex">
            <span className="pill relative grid h-14 w-24 place-items-center overflow-hidden">
              <Image src="/img/trays/spicy-tuna.webp" alt="" fill sizes="96px" className="object-cover opacity-60 transition group-hover:scale-110" />
              <span className="relative grid size-8 place-items-center rounded-full bg-rice text-nori">
                <svg viewBox="0 0 16 16" className="size-3.5 rotate-90" fill="currentColor" aria-hidden>
                  <path d="M8 3l5 9H3z" />
                </svg>
              </span>
            </span>
            <span className="text-sm uppercase leading-tight tracking-[0.14em] text-rice/80">
              Peel back
              <br />
              <span className="text-rice">the layers</span>
            </span>
          </a>

          <div className="hero-fade">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex -space-x-3">
                {FLAVORS.map((f) => (
                  <span key={f.id} className="relative size-10 overflow-hidden rounded-full border-2 border-nori">
                    <Image src={`/tex/${f.id}.webp`} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-sm leading-tight">
                <span className="display block text-2xl">4 flavors</span>
                <span className="text-rice-dim">nori packs included</span>
              </p>
            </div>
            <p className="mb-6 text-[0.95rem] leading-relaxed text-rice/75">
              Warm, creamy trays of seasoned sushi rice, piled with kani, mango, Spam or spicy tuna, then baked
              golden. Scoop it onto nori and share. Made to order in Makati.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#build" className="btn btn-orange">
                Build your tray <Arrow />
              </a>
              <a href={BUSINESS.grabfood} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                GrabFood
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
