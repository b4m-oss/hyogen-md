import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { scanHgBlocks } from "../../src/parse/scanHgBlocks.js";

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

  it("ignores normal HTML comments", () => {
    const source = "<!-- note -->";
    assert.equal(scanHgBlocks(source).length, 0);
  });

  it("ignores hyogen blocks inside code fences", () => {
    const source = "```\n<!-- @hg include ./a.md @endhg -->\n```";
    assert.equal(scanHgBlocks(source).length, 0);
  });
});
