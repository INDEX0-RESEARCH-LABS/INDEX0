import assert from "node:assert/strict"; import test from "node:test";
import { parseJSON } from "../src/index.js";
test("valid json", () => assert.deepEqual(parseJSON('{"a":1}'), {a:1}));
