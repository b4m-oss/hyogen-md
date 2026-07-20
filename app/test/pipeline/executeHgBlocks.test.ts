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

  it("passes through single-line control blocks", () => {
    const source = "<!--@hg\nif isNight\n@endhg-->\nBody";
    const { source: result } = executeHgBlocks(source);
    assert.match(result, /if isNight/);
    assert.match(result, /Body/);
  });

  it("passes through else, endif, each, endeach blocks", () => {
    const blocks = ["else", "else if score >= 60", "endif", "each item in data", "endeach"];
    for (const line of blocks) {
      const source = `<!--@hg\n${line}\n@endhg-->`;
      const { source: result } = executeHgBlocks(source);
      assert.match(result, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("passes through declaration lines already handled upstream", () => {
    const source = "<!--@hg\nconst x = 1\n@endhg-->";
    const { source: result, directives } = executeHgBlocks(source);
    assert.equal(directives.length, 0);
    assert.match(result, /const x = 1/);
  });

  it("throws parse_error for unsupported multi-line hyogen block", () => {
    try {
      executeHgBlocks("<!--@hg\nfoo\nbar\n@endhg-->");
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

  it("throws parse_error for unsupported single-line hyogen directive", () => {
    try {
      executeHgBlocks("<!--@hg\nfoobar x\n@endhg-->");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
