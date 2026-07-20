import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { scanHgBlocks } from "../../src/parse/scanHgBlocks.js";

describe("executeHgBlocks integration", () => {
  it("processes all blocks found by scanHgBlocks", () => {
    const source = "<!--@hg\ninclude ./a.md\n@endhg--><!--@hg\ninclude ./b.md\n@endhg-->";
    assert.equal(scanHgBlocks(source).length, 2);
    assert.equal(executeHgBlocks(source).directives.length, 2);
  });
});
