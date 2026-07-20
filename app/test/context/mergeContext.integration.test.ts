import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mergeContext } from "../../src/context/mergeContext.js";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";

describe("mergeContext integration", () => {
  it("merges API context with front matter context", () => {
    const source = "---\ntitle: From FM\n---\n# Body";
    const { context: fmContext } = parseFrontMatter(source);
    const merged = mergeContext({ title: "API" }, fmContext);
    assert.equal(merged.title, "From FM");
  });
});
