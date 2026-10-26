"use client";

import { useEffect, useState } from "react";
import { BUSINESS } from "@/data/menu";

const LINKS = [
  { href: "#flavors", label: "Flavors" },
  { href: "#sizes", label: "Sizes" },
  { href: "#build", label: "Build a tray" },
  { href: "#reviews", label: "Reviews" },
  { href: "#find-us", label: "Find us" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding,background] duration-500 ${
        scrolled ? "bg-nori/70 py-3 backdrop-blur-md" : "py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8" aria-label="Main">
        <a href="#top" className="display text-[1.35rem] leading-none text-rice">
          Sushi Bake <span className="italic text-orange">by Maja</span>
        </a>

        <ul className="hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="pill block px-4 py-2 text-[0.8rem] text-rice/85 transition hover:border-orange/60 hover:text-rice">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={BUSINESS.grabfood} target="_blank" rel="noopener noreferrer" className="btn btn-orange hidden !py-2.5 text-[0.82rem] sm:inline-flex">
            Order now
            <Arrow />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="pill grid size-11 place-items-center lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-rice transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-0.5 w-5 bg-rice transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden transition-[max-height] duration-500 lg:hidden ${open ? "max-h-96" : "max-h-0"}`}
      >
        <ul className="mx-4 mt-3 grid gap-1 rounded-3xl border border-line bg-nori-2/95 p-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-rice/90 hover:bg-nori-3">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={BUSINESS.grabfood} target="_blank" rel="noopener noreferrer" className="btn btn-orange mt-1 w-full justify-center">
              Order on GrabFood <Arrow />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
