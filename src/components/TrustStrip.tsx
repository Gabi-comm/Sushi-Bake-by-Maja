const ITEMS = ["Delivery or pick-up", "Callisto Tower 2, Makati", "Generous toppings", "Nori packs included", "Baked to order", "Now on GrabFood"];

export default function TrustStrip() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-line bg-orange py-4 text-on-accent" aria-label="Why Sushi Bake by Maja">
      <ul className="flex w-max animate-[marquee_32s_linear_infinite] gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <li key={i} aria-hidden={i >= ITEMS.length} className="flex items-center gap-10 text-sm font-extrabold uppercase tracking-[0.2em]">
            {t}
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <ellipse cx="10" cy="10" rx="9" ry="4.5" transform="rotate(-30 10 10)" fill="currentColor" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
