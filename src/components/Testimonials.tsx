import Image from "next/image";
import { BUSINESS, TESTIMONIALS } from "@/data/menu";
import Reveal from "./Reveal";

/**
 * The reviews came from Maja's Messenger inbox, so they're shown as that chat: warm rice-paper
 * card, customer bubbles on the left, Maja's thank-you on the right. Paper/ink are fixed
 * colours, so the block reads the same on the orange and the nori theme.
 */
export default function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-20 px-4 py-12 md:px-8" aria-labelledby="reviews-title">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2.2rem] bg-paper px-5 py-16 text-ink md:px-14 md:py-24">
        {/* sesame scatter */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 3px 1.6px at 20% 30%, #d9c7a3 98%, transparent), radial-gradient(ellipse 3px 1.6px at 70% 60%, #d9c7a3 98%, transparent), radial-gradient(ellipse 2.4px 1.4px at 45% 85%, #2a2420 98%, transparent)",
            backgroundSize: "90px 70px, 130px 110px, 110px 90px",
          }}
        />
        <div className="relative grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <Reveal>
            <p className="mb-4 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-ink/60">
              <span className="text-[#e8631a]">+</span> Customer feedback
            </p>
            <h2 id="reviews-title" className="display text-[clamp(3rem,6.5vw,5.5rem)]">
              Babalik-<span className="italic text-[#d4560f]">balikan</span> mo talaga.
            </h2>
            <p className="mt-6 max-w-sm text-ink/70">
              Straight from our Messenger inbox. The word that keeps coming up is <em>sulit</em>: worth every peso.
            </p>
            <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer" className="btn mt-8 bg-ink text-paper hover:bg-[#2a2420]">
              More on our Facebook
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-[1.8rem] bg-white shadow-[0_40px_80px_-40px_rgba(26,18,12,0.55)] ring-1 ring-ink/5">
              <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-3.5">
                <span className="relative size-9 overflow-hidden rounded-full bg-[#e8631a]">
                  <Image src="/icons/icon-192.png" alt="" fill sizes="36px" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold">Sushi Bake by Maja</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink/55">
                    <span className="size-2 rounded-full bg-[#31a24c]" /> Messenger
                  </span>
                </span>
              </div>

              <ul className="space-y-3 px-4 py-5 md:px-5">
                {TESTIMONIALS.map((t, i) => {
                  // Unnamed screenshots are labelled "Messenger review" in the data; the chat frame already says that.
                  const name = t.name === "Messenger review" ? null : t.name;
                  return (
                    <Reveal as="li" key={i} delay={200 + i * 110} className="flex max-w-[88%] items-end gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#efe6d8] text-[0.7rem] font-bold text-ink/70">
                        {name ? name[0] : "★"}
                      </span>
                      <figure className="rounded-[1.3rem] rounded-bl-md bg-[#f0ece6] px-4 py-2.5">
                        <blockquote className="text-[0.98rem] leading-snug">{t.quote}</blockquote>
                        {name && (
                          <figcaption className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink/50">{name}</figcaption>
                        )}
                      </figure>
                    </Reveal>
                  );
                })}
                <Reveal as="li" delay={200 + TESTIMONIALS.length * 110} className="ml-auto w-fit max-w-[80%]">
                  <p className="rounded-[1.3rem] rounded-br-md bg-[#e8631a] px-4 py-2.5 text-[0.98rem] font-medium text-[#1a0d05]">
                    Salamat po sa support! See you sa next order 🧡
                  </p>
                  <p className="mt-1 text-right text-[0.7rem] text-ink/45">Maja</p>
                </Reveal>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
