import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseExpression", () => {
  it("parses identifier", () => {
    const node = parseExpression("title");
    assert.equal(node.type, "identifier");
  });

  it("parses member access", () => {
    const node = parseExpression("object.key");
    assert.equal(node.type, "member");
  });

  it("parses default pipe", () => {
    const node = parseExpression('color | "transparent"');
    assert.equal(node.type, "default");
  });

  it("parses registered-style function calls", () => {
    const node = parseExpression('greet({ name: "Ada" })');
    assert.equal(node.type, "call");
    if (node.type === "call") {
      assert.equal(node.callee, "greet");
      assert.deepEqual(node.args, {
        name: { type: "literal", value: "Ada" },
      });
    }
  });

  it("parses expression values in call arguments", () => {
    const node = parseExpression("cityItem({ city: item.name, population: 1 })");
    assert.equal(node.type, "call");
    if (node.type === "call") {
      assert.equal(node.args.city?.type, "member");
      assert.deepEqual(node.args.population, { type: "literal", value: 1 });
    }
  });

  it("parses ternary expressions", () => {
    const node = parseExpression("a ? b : c");
    assert.equal(node.type, "ternary");
  });

  it("throws parse_error for bracket access", () => {
    try {
      parseExpression("arr[0]");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("parses arithmetic expressions", () => {
    const node = parseExpression("1 + 2");
    assert.equal(node.type, "binary");
  });

  it("throws parse_error for empty input", () => {
    try {
      parseExpression("   ");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
