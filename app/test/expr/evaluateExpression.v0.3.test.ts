import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("evaluateExpression v0.3", () => {
  it("evaluates comparisons", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("90 >= 90"), { context: {} }),
      true,
    );
    assert.equal(
      await evaluateExpression(parseExpression('1 == "1"'), { context: {} }),
      true,
    );
  });

  it("evaluates logical operators", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("true && false"), { context: {} }),
      false,
    );
    assert.equal(
      await evaluateExpression(parseExpression('false || "ok"'), { context: {} }),
      "ok",
    );
  });

  it("evaluates unary not", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("!0"), { context: {} }),
      true,
    );
    assert.equal(
      await evaluateExpression(parseExpression('!!""'), { context: {} }),
      false,
    );
  });

  it("evaluates arithmetic", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("1 + 2"), { context: {} }),
      3,
    );
    assert.equal(
      await evaluateExpression(parseExpression("10 / 4"), { context: {} }),
      2.5,
    );
  });

  it("evaluates nested logical and comparison", async () => {
    const node = parseExpression("active && score >= 90");
    assert.equal(
      await evaluateExpression(node, { context: { score: 95, active: true } }),
      true,
    );
  });

  it("treats zero from default pipe as falsy for conditions", async () => {
    const node = parseExpression("count | 0");
    assert.equal(
      await evaluateExpression(node, { context: {} }),
      0,
    );
  });

  it("throws forbidden_property_access for dangerous keys", async () => {
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
