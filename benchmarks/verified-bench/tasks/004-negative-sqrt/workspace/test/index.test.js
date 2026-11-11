import assert from "node:assert/strict"; import test from "node:test";
import { safeSqrt } from "../src/index.js";
test("positive", () => assert.equal(safeSqrt(4), 2));
