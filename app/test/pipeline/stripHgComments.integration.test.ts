import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { stripHgComments } from "../../src/pipeline/stripHgComments.js";

describe("stripHgComments integration", () => {
  it("strips blocks produced by executeHgBlocks source before marker replacement", () => {
    const source = "A<!--@hg\ninclude ./a.md\n@endhg-->B";
    const { source: marked } = executeHgBlocks(source);
    const stripped = stripHgComments(marked);
    assert.match(stripped, /A/);
    assert.match(stripped, /B/);
    assert.doesNotMatch(stripped, /@hg/);
  });
});
