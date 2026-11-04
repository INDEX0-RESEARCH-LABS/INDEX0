// Cart pricing for the Banchan app.
// Prices are in dollars; the UI rounds to cents for display.

export const DELIVERY_FEE = 3.9;
export const FREE_DELIVERY_MINIMUM = 25;

/** Sum of price × quantity across the cart. */
export function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Percentage promo from the PROMOS table, floored at the order subtotal. */
export const PROMOS = {
  FIRSTBITE: 5
};

export function discount(items, promo) {
  if (!promo) return 0;
  const amount = PROMOS[promo];
  if (amount === undefined) return 0;
  return Math.min(amount, subtotal(items));
}

export function deliveryFee(items, promo) {
  // Free delivery once the order clears the minimum.
  // NOTE: this reads the cart before the promo — see test/checkout.test.js.
  return subtotal(items) >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
}

export function total(items, promo) {
  return subtotal(items) - discount(items, promo) + deliveryFee(items, promo);
}
