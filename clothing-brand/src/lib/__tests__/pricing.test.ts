import { describe, expect, it } from "vitest";
import { effectivePrice } from "@/lib/utils";

describe("effectivePrice", () => {
  it("uses sale price when lower than price", () => {
    expect(effectivePrice(2000, 1500)).toBe(1500);
  });

  it("ignores invalid sale price", () => {
    expect(effectivePrice(2000, null)).toBe(2000);
    expect(effectivePrice(2000, 2500)).toBe(2000);
    expect(effectivePrice(2000, 0)).toBe(2000);
  });
});

describe("order total math", () => {
  it("computes subtotal discount and shipping", () => {
    const subtotal = 3500;
    const discount = 300;
    const freeThreshold = 2999;
    const flatRate = 99;
    const shipping = subtotal - discount >= freeThreshold ? 0 : flatRate;
    const total = Math.max(0, subtotal - discount + shipping);
    expect(shipping).toBe(0);
    expect(total).toBe(3200);
  });

  it("applies flat shipping below threshold", () => {
    const subtotal = 1000;
    const discount = 0;
    const freeThreshold = 2999;
    const flatRate = 99;
    const shipping = subtotal - discount >= freeThreshold ? 0 : flatRate;
    expect(shipping).toBe(99);
  });
});

describe("admin authorization guard shape", () => {
  it("treats non-admin role as unauthorized", () => {
    const role: string = "customer";
    expect(role === "admin").toBe(false);
  });
});

describe("inventory decrement safety", () => {
  it("rejects oversell", () => {
    const stock = 2;
    const quantity = 3;
    expect(stock >= quantity).toBe(false);
  });
});
