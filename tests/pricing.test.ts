import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDiscount, normalizeCode, orderTotals, shippingFor, type DiscountRule } from "../src/lib/pricing";

const rule = (overrides: Partial<DiscountRule> = {}): DiscountRule => ({
  code: "TEST",
  type: "PERCENT",
  value: 10,
  minSubtotal: 0,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  ...overrides,
});

describe("shipping", () => {
  it("is free for an empty cart", () => assert.equal(shippingFor(0), 0));
  it("charges the flat fee below the threshold", () => assert.equal(shippingFor(2998), 99));
  it("is free at the threshold", () => assert.equal(shippingFor(2999), 0));
});

describe("orderTotals", () => {
  it("adds shipping below the threshold", () => {
    assert.deepEqual(orderTotals(1299), { subtotal: 1299, discountAmount: 0, shippingFee: 99, total: 1398 });
  });
  it("applies the free-shipping threshold after the discount", () => {
    const totals = orderTotals(3100, 200);
    assert.equal(totals.shippingFee, 99);
    assert.equal(totals.total, 2999);
  });
  it("never discounts below zero", () => {
    assert.equal(orderTotals(500, 900).discountAmount, 500);
    assert.equal(orderTotals(500, -50).discountAmount, 0);
  });
});

describe("evaluateDiscount", () => {
  it("rounds percentage discounts down to whole rupees", () => {
    assert.deepEqual(evaluateDiscount(rule({ value: 15 }), 1299), { ok: true, amount: 194 });
  });
  it("caps fixed discounts at the subtotal", () => {
    assert.deepEqual(evaluateDiscount(rule({ type: "FIXED", value: 2000 }), 999), { ok: true, amount: 999 });
  });
  it("rejects inactive, expired, used-up and below-minimum codes", () => {
    const now = new Date("2026-10-16T00:00:00Z");
    assert.equal(evaluateDiscount(rule({ isActive: false }), 1000, now).ok, false);
    assert.equal(evaluateDiscount(rule({ expiresAt: new Date("2026-10-15T00:00:00Z") }), 1000, now).ok, false);
    assert.equal(evaluateDiscount(rule({ maxUses: 5, usedCount: 5 }), 1000, now).ok, false);
    assert.equal(evaluateDiscount(rule({ minSubtotal: 1500 }), 1000, now).ok, false);
  });
  it("accepts a code that expires later", () => {
    const now = new Date("2026-10-16T00:00:00Z");
    assert.equal(evaluateDiscount(rule({ expiresAt: new Date("2026-10-17T00:00:00Z") }), 1000, now).ok, true);
  });
  it("normalizes codes", () => assert.equal(normalizeCode("  welcome10 "), "WELCOME10"));
});
