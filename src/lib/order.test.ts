import { describe as group, expect, it } from "vitest";
import { OrderError, describe, lineTotal, messengerLink, noriCount, orderMessage, orderTotal, parseStart, trayPrice } from "./order";

group("trayPrice", () => {
  it("uses the menu-card price for a single flavor", () => {
    expect(trayPrice({ size: "regular", flavors: ["california-maki"] })).toBe(430);
    expect(trayPrice({ size: "large", flavors: ["creamy-kani"] })).toBe(500);
    expect(trayPrice({ size: "family", flavors: ["cheesy-spam"] })).toBe(1150);
  });

  it("charges the pricier flavor plus ₱100 for a split", () => {
    expect(trayPrice({ size: "large", flavors: ["creamy-kani", "spicy-tuna"] })).toBe(700);
    expect(trayPrice({ size: "family", flavors: ["california-maki", "cheesy-spam"] })).toBe(1300);
  });

  it("prices the Quad flat", () => {
    expect(trayPrice({ size: "quad", flavors: [] })).toBe(1400);
  });
});

group("lineTotal", () => {
  it("adds extra nori and multiplies by quantity", () => {
    expect(lineTotal({ size: "regular", flavors: ["spicy-tuna"], extraNori: 2, qty: 3 })).toBe((400 + 80) * 3);
  });

  it("rejects a split on a Regular tray", () => {
    expect(() => lineTotal({ size: "regular", flavors: ["spicy-tuna", "creamy-kani"], extraNori: 0, qty: 1 })).toThrow(OrderError);
  });

  it("rejects the same flavor twice, zero qty and negative nori", () => {
    expect(() => lineTotal({ size: "large", flavors: ["spicy-tuna", "spicy-tuna"], extraNori: 0, qty: 1 })).toThrow(OrderError);
    expect(() => lineTotal({ size: "large", flavors: ["spicy-tuna"], extraNori: 0, qty: 0 })).toThrow(OrderError);
    expect(() => lineTotal({ size: "large", flavors: ["spicy-tuna"], extraNori: -1, qty: 1 })).toThrow(OrderError);
  });

  it("rejects no flavor on a non-Quad tray", () => {
    expect(() => lineTotal({ size: "family", flavors: [], extraNori: 0, qty: 1 })).toThrow(OrderError);
  });
});

group("nori and messages", () => {
  it("counts included plus extra nori", () => {
    expect(noriCount({ size: "family", flavors: ["creamy-kani"], extraNori: 1, qty: 2 })).toBe(10);
    expect(noriCount({ size: "quad", flavors: [], extraNori: 0, qty: 1 })).toBe(6);
  });

  it("builds a readable order and an encoded Messenger link", () => {
    const items = [
      { size: "quad" as const, flavors: [], extraNori: 0, qty: 1 },
      { size: "large" as const, flavors: ["california-maki" as const, "creamy-kani" as const], extraNori: 1, qty: 1 },
    ];
    expect(describe(items[1])).toBe("1× Large California Maki + Creamy Kani, +1 extra nori — ₱740");
    expect(orderTotal(items)).toBe(2140);
    expect(orderMessage(items)).toContain("Total: ₱2,140");
    const link = messengerLink(items);
    expect(link.startsWith("https://m.me/61591539816333?text=")).toBe(true);
    expect(decodeURIComponent(link.split("?text=")[1])).toBe(orderMessage(items));
  });
});

group("parseStart", () => {
  it("preselects a known size and flavor", () => {
    expect(parseStart("family", "spicy-tuna")).toEqual({ size: "family", flavor: "spicy-tuna" });
  });

  it("defaults to Large and drops unknown values", () => {
    expect(parseStart(null, "creamy-kani")).toEqual({ size: "large", flavor: "creamy-kani" });
    expect(parseStart("huge", "pizza")).toEqual({ size: "large", flavor: undefined });
  });

  it("ignores a flavor on the Quad", () => {
    expect(parseStart("quad", "cheesy-spam")).toEqual({ size: "quad", flavor: undefined });
  });
});
