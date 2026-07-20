import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";
import { applyFrontMatterOutputOption } from "../../src/pipeline/applyFrontMatterOutputOption.js";

describe("applyFrontMatterOutputOption integration", () => {
  it("restores front matter captured by parseFrontMatter", () => {
    const source = "---\ntitle: T\n---\n# Body";
    const { rawFrontMatter } = parseFrontMatter(source);
    const result = applyFrontMatterOutputOption("# Body", {
      preserveFrontMatter: true,
      rawFrontMatter,
    });
    assert.match(result, /^---\n/);
    assert.match(result, /title: T/);
  });
});
