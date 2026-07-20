import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeContext } from "../../src/context/mergeContext.js";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";
import { renderDocument } from "../../src/pipeline/renderDocument.js";

describe("renderDocument integration", () => {
  it("merges API context with front matter before interpolation", async () => {
    const source = "---\ntitle: FM\n---\n# {{ title }}";
    const { context: fmContext } = parseFrontMatter(source);
    const context = mergeContext({ title: "API" }, fmContext);
    const result = await renderDocument(source, { context });
    assert.equal(result.markdown, "# FM");
  });
});
