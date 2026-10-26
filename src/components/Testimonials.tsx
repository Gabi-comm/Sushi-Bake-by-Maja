import { BUSINESS, TESTIMONIALS } from "@/data/menu";
import Reveal from "./Reveal";

export default function Testimonials() {
  return (
    <section id="reviews" className="px-4 py-12 md:px-8" aria-labelledby="reviews-title">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2.2rem] bg-mango px-5 py-16 text-nori md:px-14 md:py-24">
        <span aria-hidden className="display pointer-events-none absolute -right-6 -top-10 select-none text-[16rem] leading-none text-nori/[0.06] md:text-[24rem]">
          “
        </span>
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="mb-4 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-nori/70">
              <span>+</span> Customer feedback
            </p>
            <h2 id="reviews-title" className="display text-[clamp(3rem,6.5vw,5.5rem)]">
              Babalik-<span className="italic">balikan</span> mo talaga.
            </h2>
            <p className="mt-6 max-w-sm text-nori/75">
              Straight from our Messenger inbox. The word that keeps coming up is <em>sulit</em>: worth every peso.
            </p>
            <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer" className="btn mt-8 bg-nori text-rice hover:bg-nori-3">
              More on our Facebook
            </a>
          </Reveal>

          <ul className="space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal as="li" key={i} delay={i * 90} className={i % 2 ? "md:ml-14" : ""}>
                <figure className="rounded-[1.6rem] rounded-bl-md bg-rice px-5 py-4 shadow-[0_18px_40px_-20px_rgba(20,17,15,0.6)]">
                  <blockquote className="text-[1.02rem] leading-relaxed">{t.quote}</blockquote>
                  <figcaption className="mt-2 text-xs font-semibold uppercase tracking-wider text-nori/55">— {t.name}</figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
