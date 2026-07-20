import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";

describe("evaluateExpression integration", () => {
  it("works inside interpolateExpressions", () => {
    const markdown = interpolateExpressions('Hello {{ name | "World" }}', {});
    assert.equal(markdown, "Hello World");
  });
});
