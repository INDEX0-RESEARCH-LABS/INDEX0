import assert from "node:assert/strict"; import test from "node:test";
import { divide } from "../workspace/src/index.js";
test("throws on zero denom", () => assert.throws(() => divide(1,0), RangeError));
test("normal still works", () => assert.equal(divide(9,3), 3));
