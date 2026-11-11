import assert from "node:assert/strict"; import test from "node:test";
import { isEmpty } from "../workspace/src/index.js";
test("null empty", () => assert.ok(isEmpty(null)));
test("undefined empty", () => assert.ok(isEmpty(undefined)));
test("zero not empty", () => assert.ok(!isEmpty(0)));
test("false not empty", () => assert.ok(!isEmpty(false)));
test("string not empty", () => assert.ok(!isEmpty("hi")));
