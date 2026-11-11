import assert from "node:assert/strict"; import test from "node:test";
import { divide } from "../src/index.js";
test("normal", () => assert.equal(divide(10,2), 5));
