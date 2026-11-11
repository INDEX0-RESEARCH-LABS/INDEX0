import assert from "node:assert/strict"; import test from "node:test";
import { safeParseInt } from "../workspace/src/index.js";
test("non-numeric returns 0", () => assert.equal(safeParseInt("abc"), 0));
test("numeric ok", () => assert.equal(safeParseInt("7"), 7));
test("empty returns 0", () => assert.equal(safeParseInt(""), 0));
