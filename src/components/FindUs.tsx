import { BUSINESS } from "@/data/menu";
import Reveal from "./Reveal";
import { Arrow } from "./Nav";

const CARDS = [
  {
    href: BUSINESS.grabfood,
    title: "GrabFood",
    body: "Delivered to your door. Search “Sushi Bake by Maja” or tap here.",
    cta: "Order on GrabFood",
    tone: "bg-orange text-on-accent",
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M6 17h4l3-6h4l1 6M13 11l-1-4H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: BUSINESS.facebook,
    title: "Facebook",
    body: "New flavors, promos and drop days. Follow Sushi Bake by Maja.",
    cta: "Visit our page",
    tone: "bg-nori-2 text-rice",
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z" />
      </svg>
    ),
  },
  {
    href: BUSINESS.messenger,
    title: "Messenger",
    body: "Pre-orders, pick-up times and party trays. Send us a message.",
    cta: "Message us",
    tone: "bg-nori-2 text-rice",
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.8.2 1.8.3 2.7.3 5 0 9-3.7 9-8.3S17 3 12 3zm.9 11.1l-2.3-2.4-4.4 2.4 4.9-5.1 2.3 2.4 4.3-2.4z" />
      </svg>
    ),
  },
];

export default function FindUs() {
  return (
    <section id="find-us" className="py-24 md:py-32" aria-labelledby="find-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="text-orange">+</span> Order & find us
          </p>
          <h2 id="find-title" className="display text-[clamp(3rem,7vw,6rem)]">
            Hungry <span className="italic text-orange">now?</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex h-full min-h-[260px] flex-col justify-between rounded-[1.8rem] border border-line p-7 transition duration-500 hover:-translate-y-1.5 ${c.tone}`}
              >
                <div className="flex items-start justify-between">
                  {c.icon}
                  <span className="grid size-11 place-items-center rounded-full border border-current/20 transition group-hover:rotate-[-45deg]">
                    <Arrow />
                  </span>
                </div>
                <div>
                  <h3 className="display text-5xl">{c.title}</h3>
                  <p className="mt-2 text-sm opacity-75">{c.body}</p>
                  <p className="mt-5 text-sm font-bold">{c.cta}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-4 grid gap-4 rounded-[1.8rem] border border-line p-7 md:grid-cols-3 md:items-center">
          <div>
            <p className="eyebrow">Pick-up</p>
            <p className="mt-2 text-lg">{BUSINESS.address}</p>
          </div>
          <div>
            <p className="eyebrow">Call or text</p>
            <a href={BUSINESS.phoneHref} className="mt-2 block text-lg hover:text-orange">
              {BUSINESS.phone}
            </a>
          </div>
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-self-start md:justify-self-end">
            Open in Google Maps <Arrow />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
