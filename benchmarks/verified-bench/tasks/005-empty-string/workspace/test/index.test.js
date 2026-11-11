import assert from "node:assert/strict"; import test from "node:test";
import { firstChar } from "../src/index.js";
test("normal", () => assert.equal(firstChar("hello"), "H"));
