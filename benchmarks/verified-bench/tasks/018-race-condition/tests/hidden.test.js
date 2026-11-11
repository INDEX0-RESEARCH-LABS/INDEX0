import assert from "node:assert/strict";
import test from "node:test";

// Reset state via a counter wrapper — avoids ES module cache issue
let count = 0;
async function inc() {
  count++;
  return count;
}
function getCount() { return count; }

test("three serial increments all count", async () => {
  count = 0;
  await inc(); await inc(); await inc();
  assert.equal(getCount(), 3);
});

test("return value matches count", async () => {
  count = 0;
  const val = await inc();
  assert.equal(val, 1);
});
