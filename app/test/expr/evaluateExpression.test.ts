import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("evaluateExpression", () => {
  it("resolves identifier from context", async () => {
    const node = parseExpression("title");
    assert.equal(
      await evaluateExpression(node, { context: { title: "Hello" } }),
      "Hello",
    );
  });

  it("resolves nested member access", async () => {
    const node = parseExpression("meta.id");
    assert.equal(
      await evaluateExpression(node, { context: { meta: { id: 1 } } }),
      1,
    );
  });

  it("uses default pipe fallback for unbound identifiers", async () => {
    const node = parseExpression('color | "transparent"');
    assert.equal(await evaluateExpression(node, { context: {} }), "transparent");
  });

  it("treats zero as falsy in default pipe", async () => {
    const node = parseExpression('count | "none"');
    assert.equal(
      await evaluateExpression(node, { context: { count: 0 } }),
      "none",
    );
  });

  it("treats false as falsy in default pipe", async () => {
    const node = parseExpression('flag | "yes"');
    assert.equal(
      await evaluateExpression(node, { context: { flag: false } }),
      "yes",
    );
  });

  it("returns undefined for missing intermediate properties", async () => {
    const node = parseExpression("a.b.c");
    assert.equal(await evaluateExpression(node, { context: {} }), undefined);
  });

  it("throws forbidden_property_access for __proto__ identifier", async () => {
    const node = parseExpression("__proto__");
    await assert.rejects(
      () => evaluateExpression(node, { context: {} }),
      (error: unknown) => {
        assertHyogenError(error, "forbidden_property_access");
        return true;
      },
    );
  });
});
