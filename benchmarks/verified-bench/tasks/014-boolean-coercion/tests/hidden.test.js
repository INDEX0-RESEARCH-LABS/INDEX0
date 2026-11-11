import assert from "node:assert/strict"; import test from "node:test";
import { isTruthy } from "../workspace/src/index.js";
test("empty string is falsy", () => assert.ok(!isTruthy("")));
test("zero is falsy", () => assert.ok(!isTruthy(0)));
test("null is falsy", () => assert.ok(!isTruthy(null)));
test("non-empty string truthy", () => assert.ok(isTruthy("hi")));
