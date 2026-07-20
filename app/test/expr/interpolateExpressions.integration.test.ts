import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";

describe("interpolateExpressions integration", () => {
  it("uses front matter context for interpolation", async () => {
    const { body, context } = parseFrontMatter("---\ntitle: Hi\n---\n# {{ title }}");
    const result = await interpolateExpressions(body, context);
    assert.equal(result, "# Hi");
  });
});
