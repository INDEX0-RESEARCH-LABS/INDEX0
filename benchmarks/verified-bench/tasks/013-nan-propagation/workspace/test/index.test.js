import assert from "node:assert/strict"; import test from "node:test";
import { safeParseInt } from "../src/index.js";
test("numeric", () => assert.equal(safeParseInt("42"), 42));
