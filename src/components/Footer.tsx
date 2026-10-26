import { BUSINESS } from "@/data/menu";

const EXPLORE = [
  ["#flavors", "Flavors"],
  ["#sizes", "Tray sizes"],
  ["#build", "Build a tray"],
  ["#reviews", "Reviews"],
];

const ORDER = [
  [BUSINESS.grabfood, "GrabFood"],
  [BUSINESS.facebook, "Facebook"],
  [BUSINESS.messenger, "Messenger"],
  [BUSINESS.phoneHref, BUSINESS.phone],
];

export default function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line pt-16">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 md:grid-cols-[1fr_auto_auto] md:gap-20 md:px-8">
        <p className="max-w-xs text-sm text-rice-dim">Sushi bake trays baked to order in Makati. Delivery or pick-up, nori packs included.</p>
        <nav aria-label="Explore">
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            {EXPLORE.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-rice/80 hover:text-orange">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Order">
          <p className="eyebrow mb-3">Order</p>
          <ul className="space-y-2 text-sm">
            {ORDER.map(([href, label]) => (
              <li key={href}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-rice/80 hover:text-orange">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p aria-hidden className="display mt-16 select-none whitespace-nowrap text-center text-[14vw] leading-[0.85] text-rice">
        Sushi Bake <span className="italic text-orange">by Maja</span>
      </p>
      <p className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-rice-dim md:px-8">© 2026 {BUSINESS.name}. Prices from our menu; GrabFood prices may vary.</p>
    </footer>
  );
}
