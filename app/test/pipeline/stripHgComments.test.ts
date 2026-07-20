import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { stripHgComments } from "../../src/pipeline/stripHgComments.js";

describe("stripHgComments", () => {
  it("removes hyogen comment blocks", () => {
    const source = "Hello\n<!--\n@hg\ninclude ./a.md\n@endhg\n-->\nWorld";
    assert.equal(stripHgComments(source), "Hello\n\nWorld");
  });

  it("preserves source when preserveHgComments is true", () => {
    const source = "<!--@hg\ninclude ./a.md\n@endhg-->";
    assert.equal(stripHgComments(source, true), source);
  });

  it("returns unchanged source when no hyogen blocks exist", () => {
    const source = "# Plain";
    assert.equal(stripHgComments(source), source);
  });

  it("leaves incomplete @hg comments untouched", () => {
    const source = "<!-- @hg only";
    assert.equal(stripHgComments(source), source);
  });

  it("leaves normal HTML comments untouched", () => {
    const source = "<!-- note -->";
    assert.equal(stripHgComments(source), source);
  });

  it("returns empty string for empty input", () => {
    assert.equal(stripHgComments(""), "");
  });
});
