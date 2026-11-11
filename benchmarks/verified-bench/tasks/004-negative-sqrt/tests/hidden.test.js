import assert from "node:assert/strict"; import test from "node:test";
import { safeSqrt } from "../workspace/src/index.js";
test("negative throws", () => assert.throws(() => safeSqrt(-1), RangeError));
test("zero ok", () => assert.equal(safeSqrt(0), 0));
test("positive ok", () => assert.equal(safeSqrt(9), 3));
