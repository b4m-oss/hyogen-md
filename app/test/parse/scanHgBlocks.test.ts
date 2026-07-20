import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  findUnclosedHgBlock,
  scanHgBlocks,
} from "../../src/parse/scanHgBlocks.js";
import { extractHgBlockLines } from "../../src/logic/hgBlockUtils.js";

describe("scanHgBlocks", () => {
  it("detects multiline hyogen block", () => {
    const source = "<!--\n@hg\ninclude ./a.md\n@endhg\n-->\n";
    const blocks = scanHgBlocks(source);
    assert.equal(blocks.length, 1);
    assert.match(blocks[0]!.inner, /include \.\/a\.md/);
  });

  it("detects minified hyogen block", () => {
    const source = "<!--@hg\ninclude ./a.md\n@endhg-->";
    const blocks = scanHgBlocks(source);
    assert.equal(blocks.length, 1);
  });

  it("detects @@ shorthand block", () => {
    const source = "<!--@@\ninclude ./a.md\n@@-->";
    const blocks = scanHgBlocks(source);
    assert.equal(blocks.length, 1);
    assert.deepEqual(extractHgBlockLines(blocks[0]!.inner), [
      "include ./a.md",
    ]);
  });

  it("extracts equivalent inner content for @hg and @@", () => {
    const hg = scanHgBlocks("<!--@hg\nconst x = 1\n@endhg-->");
    const at = scanHgBlocks("<!--@@\nconst x = 1\n@@-->");
    assert.deepEqual(
      extractHgBlockLines(hg[0]!.inner),
      extractHgBlockLines(at[0]!.inner),
    );
  });

  it("returns blocks in document order", () => {
    const source = [
      "<!--@hg\ninclude ./a.md\n@endhg-->",
      "<!--@hg\ninclude ./b.md\n@endhg-->",
    ].join("\n");
    const blocks = scanHgBlocks(source);
    assert.equal(blocks.length, 2);
    assert.match(blocks[0]!.inner, /a\.md/);
    assert.match(blocks[1]!.inner, /b\.md/);
  });

  it("does not detect @hg without @endhg", () => {
    const source = "<!--\n@hg\ninclude ./a.md\n-->";
    assert.equal(scanHgBlocks(source).length, 0);
  });

  it("does not detect @@ without closing @@", () => {
    const source = "<!--@@\ninclude ./a.md\n-->";
    assert.equal(scanHgBlocks(source).length, 0);
    assert.equal(findUnclosedHgBlock(source), true);
  });

  it("flags mixed @hg and @@ markers as unclosed/invalid", () => {
    const source = "<!--@hg\ninclude ./a.md\n@@-->";
    assert.equal(scanHgBlocks(source).length, 0);
    assert.equal(findUnclosedHgBlock(source), true);
  });

  it("ignores normal HTML comments", () => {
    const source = "<!-- note -->";
    assert.equal(scanHgBlocks(source).length, 0);
  });

  it("ignores hyogen blocks inside code fences", () => {
    const source = "```\n<!-- @hg include ./a.md @endhg -->\n```";
    assert.equal(scanHgBlocks(source).length, 0);
  });

  it("ignores @@ blocks inside code fences", () => {
    const source = "```\n<!--@@\ninclude ./a.md\n@@-->\n```";
    assert.equal(scanHgBlocks(source).length, 0);
  });
});
