import assert from "node:assert/strict"; import test from "node:test";
import { greet } from "../workspace/src/index.js";
test("null returns guest", () => assert.equal(greet(null), "Hello, Guest!"));
test("undefined returns guest", () => assert.equal(greet(undefined), "Hello, Guest!"));
test("normal still works", () => assert.equal(greet("Bob"), "Hello, Bob!"));
