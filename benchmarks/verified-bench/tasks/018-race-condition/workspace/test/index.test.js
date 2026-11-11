import assert from "node:assert/strict"; import test from "node:test";
import { inc, getCount } from "../src/index.js";
test("increments", async () => { await inc(); assert.ok(getCount() > 0); });
