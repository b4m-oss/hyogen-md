import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("interpolateExpressions", () => {
  it("replaces double-brace expressions", async () => {
    const result = await interpolateExpressions("Hello {{ name }}", {
      name: "World",
    });
    assert.equal(result, "Hello World");
  });

  it("applies default pipe fallback", async () => {
    const result = await interpolateExpressions('{{ title | "Untitled" }}', {});
    assert.equal(result, "Untitled");
  });

  it("replaces multiple expressions on one line", async () => {
    const result = await interpolateExpressions("{{ a }} and {{ b }}", {
      a: "X",
      b: "Y",
    });
    assert.equal(result, "X and Y");
  });

  it("treats triple braces the same as double braces", async () => {
    const result = await interpolateExpressions("Hello {{{ name }}}", {
      name: "World",
    });
    assert.equal(result, "Hello World");
  });

  it("throws parse_error for invalid expressions", async () => {
    await assert.rejects(
      () => interpolateExpressions("{{ foo() }}", {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for unclosed expressions", async () => {
    await assert.rejects(
      () => interpolateExpressions("{{ name", {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("stringifies object values", async () => {
    const result = await interpolateExpressions("{{ obj }}", {
      obj: { x: 1 },
    });
    assert.equal(result, "[object Object]");
  });
});
