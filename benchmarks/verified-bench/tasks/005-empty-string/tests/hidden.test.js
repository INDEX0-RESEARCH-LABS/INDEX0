import assert from "node:assert/strict"; import test from "node:test";
import { firstChar } from "../workspace/src/index.js";
test("empty returns null", () => assert.equal(firstChar(""), null));
test("normal still works", () => assert.equal(firstChar("world"), "W"));
