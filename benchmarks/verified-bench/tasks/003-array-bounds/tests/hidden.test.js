import assert from "node:assert/strict"; import test from "node:test";
import { last } from "../workspace/src/index.js";
test("empty returns undefined", () => assert.equal(last([]), undefined));
test("single element", () => assert.equal(last([42]), 42));
test("normal", () => assert.equal(last([1,2,3]), 3));
