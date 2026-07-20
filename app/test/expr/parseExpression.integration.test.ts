import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";

describe("parseExpression integration", () => {
  it("parsed nodes evaluate with context", () => {
    const node = parseExpression("meta.id");
    assert.equal(evaluateExpression(node, { meta: { id: 1 } }), 1);
  });
});
