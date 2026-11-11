import assert from "node:assert/strict"; import test from "node:test";
import { parseJSON } from "../workspace/src/index.js";
test("invalid returns null", () => assert.equal(parseJSON("not json"), null));
test("valid ok", () => assert.deepEqual(parseJSON('{"x":2}'), {x:2}));
test("empty returns null", () => assert.equal(parseJSON(""), null));
