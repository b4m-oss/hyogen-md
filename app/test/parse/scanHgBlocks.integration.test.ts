import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { scanHgBlocks } from "../../src/parse/scanHgBlocks.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("scanHgBlocks integration", () => {
  it("feeds blocks into executeHgBlocks", () => {
    const source = "<!--@hg\ninclude ./a.md\n@endhg-->";
    const blocks = scanHgBlocks(source);
    const { directives } = executeHgBlocks(source);
    assert.equal(blocks.length, directives.length);
  });

  it("executeHgBlocks throws parse_error for unclosed @hg", () => {
    try {
      executeHgBlocks("<!--\n@hg\ninclude ./a.md\n-->");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
