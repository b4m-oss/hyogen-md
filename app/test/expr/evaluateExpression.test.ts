import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";

describe("evaluateExpression", () => {
  it("resolves identifier from context", () => {
    const node = parseExpression("title");
    assert.equal(evaluateExpression(node, { title: "Hello" }), "Hello");
  });

  it("resolves nested member access", () => {
    const node = parseExpression("meta.id");
    assert.equal(evaluateExpression(node, { meta: { id: 1 } }), 1);
  });

  it("uses default pipe fallback for unbound identifiers", () => {
    const node = parseExpression('color | "transparent"');
    assert.equal(evaluateExpression(node, {}), "transparent");
  });

  it("treats zero as falsy in default pipe", () => {
    const node = parseExpression('count | "none"');
    assert.equal(evaluateExpression(node, { count: 0 }), "none");
  });

  it("treats false as falsy in default pipe", () => {
    const node = parseExpression('flag | "yes"');
    assert.equal(evaluateExpression(node, { flag: false }), "yes");
  });

  it("returns undefined for missing intermediate properties", () => {
    const node = parseExpression("a.b.c");
    assert.equal(evaluateExpression(node, {}), undefined);
  });

  it("does not throw for __proto__ member access in v0.1", () => {
    const node = parseExpression("__proto__");
    assert.doesNotThrow(() => evaluateExpression(node, {}));
  });
});
