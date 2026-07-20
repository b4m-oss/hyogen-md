import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";

describe("interpolateExpressions integration", () => {
  it("uses front matter context for interpolation", () => {
    const { body, context } = parseFrontMatter("---\ntitle: Hi\n---\n# {{ title }}");
    const result = interpolateExpressions(body, context);
    assert.equal(result, "# Hi");
  });
});
