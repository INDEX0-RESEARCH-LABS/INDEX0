import assert from "node:assert/strict"; import test from "node:test";
import { getValue } from "../workspace/src/index.js";
test("resolves to 42", async () => assert.equal(await getValue(), 42));
test("is not a bare Promise object", async () => assert.equal(typeof (await getValue()), "number"));
