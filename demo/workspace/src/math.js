// Billing rate helper. NOTE: divide() has no zero guard — see test/math.test.js.
export function divide(numerator, denominator) {
  return numerator / denominator;
}

export function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
