"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/data/menu";
import { setTheme, useTheme } from "@/lib/theme";
import InstallApp from "./InstallApp";

const LINKS = [
  { href: "/menu", label: "Flavors" },
  { href: "/menu#sizes", label: "Sizes" },
  { href: "/order", label: "Build a tray" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#find-us", label: "Find us" },
];

/** Orange (default) ⇄ nori dark. The knob carries a sesame-dotted nori sheet or a sun-orange dot. */
function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="pill relative h-11 w-[4.6rem] shrink-0"
    >
      <span
        className={`absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          dark ? "left-[calc(100%-2.25rem)] bg-[#e8631a]" : "left-1 bg-[#14110f]"
        }`}
      >
        {dark ? (
          <svg viewBox="0 0 16 16" className="size-4 text-[#1a0d05]" fill="currentColor" aria-hidden>
            <path d="M10.8 1.6a6.5 6.5 0 1 0 3.6 10.9A6 6 0 0 1 10.8 1.6Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="size-4 text-[#ffc94a]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9 13 13M3 13l1.1-1.1M11.9 4.1 13 3" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
        <Link href="/" className="display text-[1.35rem] leading-none text-rice">
          Sushi Bake <span className="italic text-orange">by Maja</span>
        </Link>

        <ul className="hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={l.href === pathname ? "page" : undefined}
                className="pill block px-4 py-2 text-[0.8rem] text-rice/85 transition hover:border-rice/50 hover:text-rice aria-[current=page]:!border-rice aria-[current=page]:!bg-rice aria-[current=page]:!text-nori"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
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
        className={`overflow-hidden transition-[max-height] duration-500 lg:hidden ${open ? "max-h-[32rem]" : "max-h-0"}`}
      >
        <ul className="mx-4 mt-3 grid gap-1 rounded-3xl border border-line bg-nori-2 p-3 shadow-2xl">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-rice/90 hover:bg-nori-3">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <InstallApp className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-rice/90 hover:bg-nori-3" />
          </li>
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
