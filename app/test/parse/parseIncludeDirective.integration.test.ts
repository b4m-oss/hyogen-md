import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { parseIncludeDirective } from "../../src/parse/parseIncludeDirective.js";
import { scanHgBlocks } from "../../src/parse/scanHgBlocks.js";

describe("parseIncludeDirective integration", () => {
  it("parses inner text extracted by scanHgBlocks", () => {
    const source = "<!--@hg\ninclude ./partials/a.md\n@endhg-->";
    const block = scanHgBlocks(source)[0]!;
    const directive = parseIncludeDirective(block.inner);
    assert.equal(directive.path, "./partials/a.md");
  });

  it("works with executeHgBlocks output", () => {
    const source = "<!--@hg\ninclude ./a.md\n@endhg-->";
    const { directives } = executeHgBlocks(source);
    assert.equal(directives[0]!.path, "./a.md");
  });
});
