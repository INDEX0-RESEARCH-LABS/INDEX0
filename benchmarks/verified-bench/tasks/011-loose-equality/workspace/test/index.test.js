import assert from "node:assert/strict"; import test from "node:test";
import { isEmpty } from "../src/index.js";
test("null is empty", () => assert.ok(isEmpty(null)));
