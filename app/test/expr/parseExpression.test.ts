import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

  it("throws parse_error for function calls", () => {
    try {
      parseExpression("foo()");
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

  it("throws parse_error for bracket access", () => {
    try {
      parseExpression("arr[0]");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for arithmetic", () => {
    try {
      parseExpression("1 + 2");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
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
