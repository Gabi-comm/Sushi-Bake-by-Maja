import { BUSINESS, EXTRAS, QUAD, flavorById, peso, sizeById, type FlavorId, type SizeId } from "@/data/menu";

export type LineItem = {
  size: SizeId;
  /** One flavor, or two for a split tray. Ignored for the Quad (always all four). */
  flavors: FlavorId[];
  extraNori: number;
  qty: number;
};

export class OrderError extends Error {}

export function validate(item: LineItem): void {
  if (item.qty < 1 || !Number.isInteger(item.qty)) throw new OrderError("Quantity must be at least 1");
  if (item.extraNori < 0 || !Number.isInteger(item.extraNori)) throw new OrderError("Extra nori can't be negative");
  if (item.size === "quad") return;
  const size = sizeById(item.size);
  if (item.flavors.length < 1 || item.flavors.length > 2) throw new OrderError("Pick one or two flavors");
  if (item.flavors.length === 2) {
    if (!size.splitAllowed) throw new OrderError(`Two flavors are only for Large and Family trays`);
    if (item.flavors[0] === item.flavors[1]) throw new OrderError("Pick two different flavors");
  }
}

/**
 * Price of one tray. A two-flavor split costs the pricier flavor's tray + the split fee
 * (the menu card only says "+₱100", so we never undercharge).
 */
export function trayPrice(item: Pick<LineItem, "size" | "flavors">): number {
  if (item.size === "quad") return QUAD.price;
  const size = item.size;
  const base = Math.max(...item.flavors.map((id) => flavorById(id).prices[size]));
  return base + (item.flavors.length === 2 ? EXTRAS.twoFlavorSplit : 0);
}

export function lineTotal(item: LineItem): number {
  validate(item);
  return (trayPrice(item) + item.extraNori * EXTRAS.noriPack) * item.qty;
}

export function orderTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

/** Nori packs included with the tray(s) plus any extras. */
export function noriCount(item: LineItem): number {
  return (sizeById(item.size).nori + item.extraNori) * item.qty;
}

export function describe(item: LineItem): string {
  const size = sizeById(item.size);
  const flavor = item.size === "quad" ? "Quad (Kani, Spam, Cali Maki, Tuna)" : item.flavors.map((id) => flavorById(id).name).join(" + ");
  const nori = item.extraNori ? `, +${item.extraNori} extra nori` : "";
  const label = item.size === "quad" ? flavor : `${size.name} ${flavor}`;
  return `${item.qty}× ${label}${nori} — ${peso(lineTotal(item))}`;
}

export function orderMessage(items: LineItem[]): string {
  return [
    `Hi ${BUSINESS.name}! I'd like to order:`,
    ...items.map((item) => `• ${describe(item)}`),
    `Total: ${peso(orderTotal(items))}`,
    "Delivery or pick-up: ",
    "Preferred date/time: ",
  ].join("\n");
}

export function messengerLink(items: LineItem[]): string {
  return `${BUSINESS.messenger}?text=${encodeURIComponent(orderMessage(items))}`;
}
