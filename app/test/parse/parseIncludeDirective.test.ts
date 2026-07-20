import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseIncludeDirective } from "../../src/parse/parseIncludeDirective.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseIncludeDirective", () => {
  it("parses include path", () => {
    const result = parseIncludeDirective("include ./partials/description.md");
    assert.deepEqual(result, {
      kind: "include",
      path: "./partials/description.md",
    });
  });

  it("allows surrounding blank lines", () => {
    const result = parseIncludeDirective("\n\ninclude ./a.md\n\n");
    assert.equal(result.path, "./a.md");
  });

  it("preserves relative path segments", () => {
    const result = parseIncludeDirective("include ../other/b.md");
    assert.equal(result.path, "../other/b.md");
  });

  it("throws parse_error when path is missing", () => {
    try {
      parseIncludeDirective("include");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for extra statements in block", () => {
    try {
      parseIncludeDirective("include ./a.md\nconst x = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for non-include directives", () => {
    try {
      parseIncludeDirective("extend ./layout.md");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for empty input", () => {
    try {
      parseIncludeDirective("");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
