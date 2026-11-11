import assert from "node:assert/strict"; import test from "node:test";
import { setName } from "../workspace/src/index.js";
test("does not mutate original", () => { const o = {name:"x"}; setName(o,"y"); assert.equal(o.name,"x"); });
test("returns new object with name", () => assert.equal(setName({age:1},"Bob").name,"Bob"));
