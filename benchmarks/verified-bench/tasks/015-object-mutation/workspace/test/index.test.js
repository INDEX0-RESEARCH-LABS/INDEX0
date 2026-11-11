import assert from "node:assert/strict"; import test from "node:test";
import { setName } from "../src/index.js";
test("sets name", () => assert.equal(setName({}, "Alice").name, "Alice"));
