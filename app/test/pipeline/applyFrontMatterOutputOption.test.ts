import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFrontMatterOutputOption } from "../../src/pipeline/applyFrontMatterOutputOption.js";

describe("applyFrontMatterOutputOption", () => {
  it("returns markdown unchanged when preserveFrontMatter is false", () => {
    const markdown = "# Body";
    assert.equal(
      applyFrontMatterOutputOption(markdown, {
        preserveFrontMatter: false,
        rawFrontMatter: "---\ntitle: T\n---",
      }),
      markdown,
    );
  });

  it("prepends raw front matter when preserveFrontMatter is true", () => {
    const raw = "---\ntitle: T\n---";
    const result = applyFrontMatterOutputOption("# Body", {
      preserveFrontMatter: true,
      rawFrontMatter: raw,
    });
    assert.equal(result, `${raw}\n# Body`);
  });

  it("returns markdown unchanged when input had no front matter", () => {
    assert.equal(
      applyFrontMatterOutputOption("# Body", { preserveFrontMatter: true }),
      "# Body",
    );
  });

  it("prepends front matter only when rawFrontMatter exists", () => {
    assert.equal(
      applyFrontMatterOutputOption("# Body", { preserveFrontMatter: true }),
      "# Body",
    );
  });
});
