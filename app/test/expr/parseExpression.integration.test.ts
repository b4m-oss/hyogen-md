import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";

describe("parseExpression integration", () => {
  it("parsed nodes evaluate with context", async () => {
    const node = parseExpression("meta.id");
    assert.equal(
      await evaluateExpression(node, { context: { meta: { id: 1 } } }),
      1,
    );
  });
});
