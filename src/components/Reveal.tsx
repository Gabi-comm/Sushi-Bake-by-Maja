"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = { as?: ElementType; delay?: number; className?: string; children: ReactNode };

/** Fades/slides its content in the first time it enters the viewport. */
export default function Reveal({ as: Tag = "div", delay = 0, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-reveal="" className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
