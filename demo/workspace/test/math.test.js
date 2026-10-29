import assert from "node:assert/strict";
import test from "node:test";

import { average, divide } from "../src/math.js";

test("divide returns the quotient", () => {
  assert.equal(divide(10, 2), 5);
});

test("average returns the mean", () => {
  assert.equal(average([2, 4, 6]), 4);
});

// The zero-denominator case below is the one this fixture is meant to catch.
test("divide rejects a zero denominator instead of returning Infinity", () => {
  assert.throws(() => divide(1, 0), RangeError);
});
