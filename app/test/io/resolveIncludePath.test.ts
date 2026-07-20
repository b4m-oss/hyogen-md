import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { resolveIncludePath } from "../../src/io/resolveIncludePath.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("resolveIncludePath", () => {
  it("resolves relative path from root", () => {
    const resolved = resolveIncludePath("/project/docs", "./partials/a.md");
    assert.equal(resolved, path.resolve("/project/docs", "./partials/a.md"));
  });

  it("allows parent directory segments", () => {
    const resolved = resolveIncludePath("/project/docs", "../other/b.md");
    assert.equal(resolved, path.resolve("/project/docs", "../other/b.md"));
  });

  it("handles trailing slash on root", () => {
    const resolved = resolveIncludePath("/project/docs/", "./a.md");
    assert.equal(resolved, path.resolve("/project/docs", "./a.md"));
  });

  it("throws parse_error when root is missing for relative path", () => {
    try {
      resolveIncludePath(undefined, "./a.md");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for empty include path", () => {
    try {
      resolveIncludePath("/project/docs", "");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("passes through absolute include paths in v0.1", () => {
    const absolute = path.resolve("/tmp/abs.md");
    assert.equal(resolveIncludePath(undefined, absolute), absolute);
  });
});
