import assert from "node:assert/strict"; import test from "node:test";
import { getValue } from "../src/index.js";
test("returns promise", async () => assert.ok((await getValue()) !== undefined));
