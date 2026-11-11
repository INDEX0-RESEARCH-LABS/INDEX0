import assert from "node:assert/strict"; import test from "node:test";
import { isTruthy } from "../src/index.js";
test("truthy number", () => assert.ok(isTruthy(1)));
