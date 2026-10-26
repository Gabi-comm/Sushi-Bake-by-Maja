import Image from "next/image";
import Link from "next/link";
import { FLAVORS, QUAD, peso, sizeById } from "@/data/menu";
import Reveal from "./Reveal";
import { Arrow } from "./Nav";

/** Home-page taste of the menu: each flavor as a top-down scoop of its baked crust. */
export default function FlavorTeaser() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="teaser-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="text-orange">+</span> The menu
            </p>
            <h2 id="teaser-title" className="display text-[clamp(3rem,7vw,6rem)]">
              Four flavors, <span className="italic text-orange">one crust.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/menu" className="btn btn-ghost">
              See every layer in 3D <Arrow />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {FLAVORS.map((f, i) => (
            <Reveal as="li" key={f.id} delay={i * 90}>
              <Link href={`/order?flavor=${f.id}`} className="group block text-center">
                <span className="relative mx-auto block aspect-square w-full max-w-[280px]">
                  {/* foil rim + scoop */}
                  <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#f4f5f7,#b9bdc4,#eef0f3,#9da2aa,#f4f5f7)] shadow-[0_30px_50px_-24px_rgba(0,0,0,0.55)] transition duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute inset-[6%] overflow-hidden rounded-full">
                    <Image
                      src={`/tex/${f.id}.webp`}
                      alt={`${f.name} sushi bake, seen from above`}
                      fill
                      sizes="(min-width: 768px) 280px, 45vw"
                      className="scale-125 object-cover transition duration-[1.4s] ease-out group-hover:rotate-[24deg] group-hover:scale-[1.4]"
                    />
                  </span>
                  {f.bestSeller && (
                    <span className="absolute -top-2 right-0 -rotate-6 rounded-md bg-mango px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-on-accent">
                      Best seller
                    </span>
                  )}
                </span>
                <span className="display mt-5 block text-[clamp(1.6rem,2.6vw,2.2rem)]">{f.name}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-rice-dim">{f.tagline}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                  from {peso(f.prices.regular)}
                  <Arrow className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-14">
          <Link
            href="/order?size=quad"
            className="group flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-line bg-nori-2/60 px-6 py-5 transition hover:border-rice/40 md:px-8"
          >
            <span>
              <span className="display text-3xl">Can&apos;t choose? The <span className="italic text-orange">Quad.</span></span>
              <span className="mt-1 block text-sm text-rice-dim">All four flavors in one tray · {sizeById("quad").pax} pax · {peso(QUAD.price)}</span>
            </span>
            <span className="btn btn-orange">
              Get the Quad <Arrow className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
