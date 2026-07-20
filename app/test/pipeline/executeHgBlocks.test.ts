import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("executeHgBlocks", () => {
  it("collects one include directive and replaces block with marker", () => {
    const source = "Hello\n<!--@hg\ninclude ./a.md\n@endhg-->\nWorld";
    const { source: replaced, directives } = executeHgBlocks(source);
    assert.equal(directives.length, 1);
    assert.equal(directives[0]!.path, "./a.md");
    assert.match(replaced, /\u0000HYOGEN_INCLUDE_0\u0000/);
    assert.doesNotMatch(replaced, /@hg/);
  });

  it("returns unchanged source when no blocks exist", () => {
    const source = "# Plain";
    const result = executeHgBlocks(source);
    assert.equal(result.source, source);
    assert.equal(result.directives.length, 0);
  });

  it("collects multiple directives in order", () => {
    const source = [
      "<!--@hg\ninclude ./a.md\n@endhg-->",
      "<!--@hg\ninclude ./b.md\n@endhg-->",
    ].join("");
    const { directives } = executeHgBlocks(source);
    assert.deepEqual(
      directives.map((d) => d.path),
      ["./a.md", "./b.md"],
    );
  });

  it("throws parse_error for non-include hyogen statements", () => {
    try {
      executeHgBlocks("<!--@hg\nconst x = 1\n@endhg-->");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for missing @endhg", () => {
    try {
      executeHgBlocks("<!--@hg\ninclude ./a.md\n-->");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for multiple include lines in one block", () => {
    try {
      executeHgBlocks("<!--@hg\ninclude ./a.md\ninclude ./b.md\n@endhg-->");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
