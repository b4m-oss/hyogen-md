import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseExpression v0.3", () => {
  it("parses comparison operators", () => {
    const node = parseExpression("score >= 90");
    assert.equal(node.type, "binary");
    if (node.type === "binary") {
      assert.equal(node.op, ">=");
    }
  });

  it("parses strict equality", () => {
    const node = parseExpression("a === b");
    assert.equal(node.type, "binary");
  });

  it("parses logical AND with comparison", () => {
    const node = parseExpression("active && score >= 90");
    assert.equal(node.type, "binary");
    if (node.type === "binary" && node.op === "&&") {
      assert.equal(node.right.type, "binary");
    }
  });

  it("parses logical OR", () => {
    const node = parseExpression("a || b");
    assert.equal(node.type, "binary");
    if (node.type === "binary") assert.equal(node.op, "||");
  });

  it("parses unary not", () => {
    const node = parseExpression("!flag");
    assert.equal(node.type, "unary");
  });

  it("parses parenthesized logical expression", () => {
    const node = parseExpression("!(a && b)");
    assert.equal(node.type, "unary");
  });

  it("parses arithmetic with precedence", () => {
    const node = parseExpression("1 + 2 * 3");
    assert.equal(node.type, "binary");
    if (node.type === "binary" && node.op === "+") {
      assert.equal(node.right.type, "binary");
      if (node.right.type === "binary") assert.equal(node.right.op, "*");
    }
  });

  it("parses arithmetic before comparison", () => {
    const node = parseExpression("count >= 1 + 2");
    assert.equal(node.type, "binary");
    if (node.type === "binary" && node.op === ">=") {
      assert.equal(node.right.type, "binary");
    }
  });

  it("parses default pipe after logical OR", () => {
    const node = parseExpression('a || b | "x"');
    assert.equal(node.type, "default");
    if (node.type === "default") {
      assert.equal(node.left.type, "binary");
    }
  });

  it("still parses v0.2 expressions", () => {
    assert.equal(parseExpression('greet({ name: "Ada" })').type, "call");
    assert.equal(parseExpression("meta.id").type, "member");
    assert.equal(parseExpression('color | "transparent"').type, "default");
  });

  it("throws parse_error for empty input", () => {
    try {
      parseExpression("   ");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unclosed parenthesis", () => {
    try {
      parseExpression("(a && b");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unknown operator", () => {
    try {
      parseExpression("a <> b");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for ternary expressions", () => {
    try {
      parseExpression("a ? b : c");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("parses arithmetic addition", () => {
    const node = parseExpression("1 + 2");
    assert.equal(node.type, "binary");
    if (node.type === "binary") assert.equal(node.op, "+");
  });
});
