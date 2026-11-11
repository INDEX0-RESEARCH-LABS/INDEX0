import assert from "node:assert/strict"; import test from "node:test";
import { add } from "../workspace/src/index.js";
test("strings parsed", () => assert.equal(add("1","2"), 3));
test("numbers ok", () => assert.equal(add(4,5), 9));
test("mixed", () => assert.equal(add("3",4), 7));
