import assert from "node:assert/strict";
import test from "node:test";

import { deliveryFee, discount, subtotal, total } from "../src/checkout.js";

// One bowl, one side, one drink — the order in the cart screenshot.
const cart = [
  { id: "bibimbap", price: 12.5, quantity: 1 },
  { id: "kimchi", price: 9.9, quantity: 1 },
  { id: "soda", price: 4.25, quantity: 1 }
];

test("adds up the cart by quantity", () => {
  assert.equal(subtotal(cart), 26.65);
});

test("applies the FIRSTBITE promo to the item subtotal", () => {
  assert.equal(discount(cart, "FIRSTBITE"), 5);
});

test("charges no delivery fee at or above the minimum", () => {
  assert.equal(deliveryFee(cart, null), 0);
});

// The bug the customer reported: a $5 promo drops the order under $25,
// but the cart still says "Free delivery".
test("charges delivery when the promo drops the subtotal below the minimum", () => {
  assert.equal(deliveryFee(cart, "FIRSTBITE"), 3.9);
  assert.equal(total(cart, "FIRSTBITE"), 25.55);
});
