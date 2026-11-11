import assert from "node:assert/strict"; import test from "node:test";
import { last } from "../src/index.js";
test("non-empty", () => assert.equal(last([1,2,3]), 3));
