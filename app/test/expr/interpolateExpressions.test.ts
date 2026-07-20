import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("interpolateExpressions", () => {
  it("replaces double-brace expressions", () => {
    const result = interpolateExpressions("Hello {{ name }}", { name: "World" });
    assert.equal(result, "Hello World");
  });

  it("applies default pipe fallback", () => {
    const result = interpolateExpressions('{{ title | "Untitled" }}', {});
    assert.equal(result, "Untitled");
  });

  it("replaces multiple expressions on one line", () => {
    const result = interpolateExpressions("{{ a }} and {{ b }}", {
      a: "X",
      b: "Y",
    });
    assert.equal(result, "X and Y");
  });

  it("treats triple braces the same as double braces", () => {
    const result = interpolateExpressions("Hello {{{ name }}}", { name: "World" });
    assert.equal(result, "Hello World");
  });

  it("throws parse_error for invalid expressions", () => {
    try {
      interpolateExpressions("{{ foo() }}", {});
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unclosed expressions", () => {
    try {
      interpolateExpressions("{{ name", {});
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("stringifies object values", () => {
    const result = interpolateExpressions("{{ obj }}", { obj: { x: 1 } });
    assert.equal(result, "[object Object]");
  });
});
