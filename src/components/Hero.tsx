"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { BUSINESS, FLAVORS } from "@/data/menu";
import { Arrow } from "./Nav";

// Sesame seeds drifting around the tray: [left %, top %, size px, rotation deg, delay s]
const SEEDS = [
  [18, 30, 9, 20, 0],
  [30, 72, 7, -30, 1.2],
  [44, 18, 6, 60, 0.4],
  [62, 82, 8, 10, 2],
  [74, 22, 7, -50, 0.8],
  [86, 64, 9, 35, 1.6],
  [54, 52, 5, -10, 2.4],
  [24, 52, 6, 80, 3],
] as const;

/**
 * A piped-mayo zigzag like the one on the California Maki: tight back-and-forth strokes
 * across the tray, with rounded turns (each corner is a quadratic curve through the midpoints).
 */
function drizzle(x0: number, y0: number, strokes: number, step: number, amp: number, tilt: number) {
  const pts = Array.from({ length: strokes + 1 }, (_, i) => {
    const jitter = Math.sin(i * 2.3) * 6; // hand-piped, not ruled
    return [x0 + i * step + jitter, y0 + (i % 2 ? -amp : amp) + (tilt * i) / strokes];
  });
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx.toFixed(1)} ${ly.toFixed(1)}`;
}

const DRIZZLE = [drizzle(30, 150, 17, 32, 95, 60), drizzle(60, 210, 15, 34, 80, -50)];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const tray = useRef<HTMLDivElement>(null);

  // Intro, first visit per session: the tray pops in centre stage on a curtain, gets a mayo
  // drizzle, then the curtain wipes up and the tray glides into its hero spot. Later visits
  // get a short entrance. INTRO_SCRIPT picks the mode before first paint and globals.css
  // holds the starting states, so nothing flashes while the JS loads. Layout effect, so a
  // client-side return to home is set up before the browser paints.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const mode = html.dataset.intro; // "play" | "enter" | undefined (reduced motion)
    try {
      sessionStorage.setItem("sbm-intro", "1");
    } catch {
      // Storage blocked: the intro just plays again next time.
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete html.dataset.intro;
      return;
    }
    let tl: gsap.core.Timeline | undefined;
    const done = () => {
      delete html.dataset.intro;
      html.style.overflow = "";
    };

    const ctx = gsap.context(() => {
      const el = tray.current!;
      const show = { visibility: "visible" };

      if (mode !== "play") {
        tl = gsap
          .timeline({ defaults: { ease: "expo.out" }, onComplete: done })
          .fromTo(".hero-line", { yPercent: 105, ...show }, { yPercent: 0, duration: 1.1, stagger: 0.08 })
          .fromTo(el, { y: -60, rotate: -14, opacity: 0, ...show }, { y: 0, rotate: 0, opacity: 1, duration: 1.3 }, 0.1)
          .fromTo(".hero-fade", { opacity: 0, y: 24, ...show }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35);
        // The inline start states now hide everything, so the CSS guard can go.
        delete html.dataset.intro;
        return;
      }

      // Start the tray at the centre of the screen, above the curtain.
      const r = el.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      const centre = Math.min(window.innerWidth * (mobile ? 0.84 : 0.62), 520) / r.width;
      const holder = el.parentElement!; // its z-index sets the stacking order
      html.style.overflow = "hidden";
      gsap.set(holder, { zIndex: 75 });
      gsap.set(el, {
        x: window.innerWidth / 2 - (r.left + r.width / 2),
        y: window.innerHeight * 0.4 - (r.top + r.height / 2),
        scale: centre * 0.55,
        rotate: -28,
        opacity: 0,
        ...show,
      });
      gsap.set(".intro-drizzle-wrap", { width: r.width * centre * 0.86 });

      tl = gsap
        .timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            gsap.set(holder, { clearProps: "zIndex" });
            done();
          },
        })
        .to(el, { opacity: 1, scale: centre, rotate: -8, duration: 1.1, ease: "back.out(1.5)" })
        .to(".intro-drizzle", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: 0.12 }, 0.45)
        .fromTo(".intro-word", { yPercent: 115, ...show }, { yPercent: 0, duration: 0.9, stagger: 0.07 }, 0.55)
        .to(".intro-drizzle-wrap", { opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.35")
        .to(".intro-curtain", { clipPath: "ellipse(140% 0% at 50% 0%)", duration: 1.15, ease: "expo.inOut" }, "<")
        .to(el, { x: 0, y: 0, scale: 1, rotate: 0, duration: 1.35, ease: "expo.inOut" }, "<")
        .fromTo(".hero-line", { yPercent: 105, ...show }, { yPercent: 0, duration: 1.1, stagger: 0.1 }, "-=0.6")
        .fromTo(".hero-fade", { opacity: 0, y: 24, ...show }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, "-=0.8")
        .set(".intro-curtain, .intro-drizzle-wrap", { display: "none" });
    }, root);

    // Any key or a tap on the curtain skips straight to the end.
    const skip = () => tl?.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("sbm:skip-intro", skip, { once: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("sbm:skip-intro", skip);
      ctx.revert();
      done();
    };
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
      className="relative min-h-[100svh] overflow-hidden pt-28 md:h-[100svh] md:min-h-[680px] md:pt-28"
      style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
    >
      {/* Intro curtain: opposite colour to the page, so the reveal reads in both themes */}
      <div
        className="intro-curtain fixed inset-0 z-[70] bg-[var(--curtain)] text-[var(--curtain-ink)] [clip-path:ellipse(140%_140%_at_50%_0%)]"
        onClick={() => window.dispatchEvent(new Event("sbm:skip-intro"))}
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(circle at 50% 40%, rgb(232 99 26 / 0.35), transparent 55%)" }}
        />
        <div className="absolute inset-x-0 bottom-[22%] text-center md:bottom-[7%]">
          <p className="display overflow-hidden pb-[0.08em] text-[clamp(3.2rem,10vw,7rem)]">
            <span className="intro-word inline-block">Sushi</span> <span className="intro-word inline-block italic">Bake</span>
          </p>
          <p className="mt-2 overflow-hidden text-xs font-bold uppercase tracking-[0.35em] md:text-sm">
            <span className="intro-word inline-block">by Maja · baked in Makati</span>
          </p>
        </div>
      </div>

      {/* Mayo drizzle, drawn over the tray while it sits centre stage. The viewBox leaves room
          for the round caps and each curve's swing, so no stroke gets clipped. */}
      <div aria-hidden className="intro-drizzle-wrap pointer-events-none fixed left-1/2 top-[40%] z-[76] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="-30 -30 660 420" className="h-auto w-full overflow-visible" fill="none">
          {DRIZZLE.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              className="intro-drizzle"
              stroke="#fbf3e7"
              strokeWidth={i ? 7 : 10}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          ))}
        </svg>
      </div>

      {/* Warm glow behind the tray */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[55%] z-0 aspect-square w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.55), rgb(var(--glow) / 0.08) 45%, transparent 70%)" }}
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
        <div className="pointer-events-none absolute left-1/2 top-[118px] z-20 w-[min(86vw,560px)] -translate-x-1/2 md:top-[8%] md:w-[min(40vw,600px)] md:translate-x-0">
          {/* GSAP owns this wrapper's transform, so positioning stays on the parent. */}
          <div ref={tray} className="hero-tray relative">
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
              {/* Spinning stamp on the tray corner */}
              <div className="hero-fade absolute -right-1 -top-2 size-[clamp(80px,9vw,124px)] md:-right-8 md:top-[2%]">
                <svg viewBox="0 0 120 120" className="size-full [animation:spin_16s_linear_infinite]" aria-hidden>
                  <defs>
                    <path id="stamp-ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
                  </defs>
                  <circle cx="60" cy="60" r="58" className="fill-rice" />
                  <text className="fill-nori text-[11.5px] font-bold uppercase tracking-[0.2em]">
                    <textPath href="#stamp-ring">Baked fresh · Made to order · </textPath>
                  </text>
                </svg>
                <span className="display absolute inset-0 grid place-items-center text-[clamp(1.4rem,2.2vw,2rem)] italic text-nori">
                  ₱400+
                </span>
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
          <Link href="/menu" className="hero-fade group hidden items-center gap-4 self-end md:flex">
            <span className="pill relative grid h-14 w-24 place-items-center overflow-hidden">
              <Image
                src="/img/trays/spicy-tuna.webp"
                alt=""
                fill
                sizes="96px"
                className="object-cover opacity-60 transition group-hover:scale-110"
              />
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
          </Link>

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
              Warm, creamy trays of seasoned sushi rice, piled with kani, mango, Spam or spicy tuna, then baked golden. Scoop it onto nori
              and share. Made to order in Makati.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/order" className="btn btn-orange">
                Build your tray <Arrow />
              </Link>
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
