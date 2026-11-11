import assert from "node:assert/strict"; import test from "node:test";
import { add } from "../src/index.js";
test("numbers", () => assert.equal(add(1,2), 3));
