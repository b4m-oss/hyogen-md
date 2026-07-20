import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import { parseExtendDirective } from "../../src/layout/parseExtendDirective.js";
import { parseBlockOpener } from "../../src/layout/parseBlockOpener.js";
import { parseBlockStructures } from "../../src/layout/parseBlockStructures.js";
import { parseExtendBlock } from "../../src/layout/parseExtendBlock.js";

describe("parseExtendDirective", () => {
  it("parses extend path", () => {
    const result = parseExtendDirective("extend layout.md");
    assert.deepEqual(result, { path: "layout.md" });
  });

  it("trims surrounding whitespace", () => {
    const result = parseExtendDirective("  extend ./layouts/base.md  ");
    assert.deepEqual(result, { path: "./layouts/base.md" });
  });

  it("returns null for non-extend directives", () => {
    const result = parseExtendDirective("include ./x.md");
    assert.equal(result, null);
  });

  it("throws parse_error for missing path", () => {
    try {
      parseExtendDirective("extend");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for extra tokens", () => {
    try {
      parseExtendDirective("extend layout.md extra");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("parseBlockOpener", () => {
  it("parses block opener", () => {
    const result = parseBlockOpener("block contents");
    assert.deepEqual(result, { kind: "block", name: "contents" });
  });

  it("parses endblock", () => {
    const result = parseBlockOpener("endblock");
    assert.deepEqual(result, { kind: "endblock" });
  });

  it("allows underscore in block name", () => {
    const result = parseBlockOpener("block sidebar_extra");
    assert.deepEqual(result, { kind: "block", name: "sidebar_extra" });
  });

  it("throws parse_error for missing name", () => {
    try {
      parseBlockOpener("block");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for end block", () => {
    try {
      parseBlockOpener("end block");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for reserved word name", () => {
    try {
      parseBlockOpener("block if");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for uppercase keyword", () => {
    try {
      parseBlockOpener("BLOCK contents");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("parseBlockStructures", () => {
  it("parses multiple blocks and keeps body ranges", () => {
    const source = [
      "A",
      "<!--@hg",
      "block contents",
      "@endhg-->",
      "Hello",
      "<!--@hg",
      "endblock",
      "@endhg-->",
      "B",
      "<!--@hg",
      "block sidebar",
      "@endhg-->",
      "Side",
      "<!--@hg",
      "endblock",
      "@endhg-->",
    ].join("\n");

    const blocks = parseBlockStructures(source, { path: "x", mode: "layout" });
    assert.equal(blocks.length, 2);
    assert.deepEqual(
      blocks.map((b) => b.name),
      ["contents", "sidebar"],
    );
    assert.ok(blocks[0]!.body.includes("Hello"));
    assert.ok(blocks[1]!.body.includes("Side"));
  });

  it("allows empty block bodies", () => {
    const source = [
      "<!--@hg",
      "block contents",
      "@endhg--><!--@hg",
      "endblock",
      "@endhg-->",
    ].join("");

    const blocks = parseBlockStructures(source, { path: "x", mode: "layout" });
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]!.name, "contents");
    assert.equal(blocks[0]!.body, "");
  });

  it("throws parse_error for endblock without block", () => {
    try {
      parseBlockStructures("<!--@hg\nendblock\n@endhg-->", {
        path: "x",
        mode: "layout",
      });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for missing endblock", () => {
    try {
      parseBlockStructures("<!--@hg\nblock contents\n@endhg-->", {
        path: "x",
        mode: "layout",
      });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for duplicate block names", () => {
    try {
      const source = [
        "<!--@hg\nblock contents\n@endhg-->body",
        "<!--@hg\nendblock\n@endhg-->",
        "<!--@hg\nblock contents\n@endhg-->body2",
        "<!--@hg\nendblock\n@endhg-->",
      ].join("\n");

      parseBlockStructures(source, { path: "x", mode: "layout" });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for orphan child blocks without extend", () => {
    try {
      const source = [
        "<!--@hg\nblock contents\n@endhg-->body",
        "<!--@hg\nendblock\n@endhg-->",
      ].join("\n");

      parseBlockStructures(source, { path: "x", mode: "child", hasExtend: false });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("parseExtendBlock", () => {
  it("parses extend block with declarations", () => {
    const result = parseExtendBlock(
      ["extend layout.md", "", "const x = 1"].join("\n"),
    );
    assert.deepEqual(result, { path: "layout.md", declarationsSource: "const x = 1" });
  });

  it("parses extend block without declarations", () => {
    const result = parseExtendBlock("extend layout.md");
    assert.deepEqual(result, { path: "layout.md", declarationsSource: "" });
  });

  it("returns null when the first line is not extend", () => {
    const result = parseExtendBlock(["const x = 1", "extend layout.md"].join("\n"));
    assert.equal(result, null);
  });

  it("throws parse_error when extend appears after the first line", () => {
    try {
      parseExtendBlock(["extend layout.md", "extend other.md"].join("\n"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

