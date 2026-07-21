import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  joinRemovalSeam,
  removalSeamNewlineDelta,
} from "../../src/pipeline/joinRemovalSeam.js";

describe("joinRemovalSeam", () => {
  it("keeps a single newline when both sides contribute one", () => {
    assert.equal(joinRemovalSeam("Hello\n", "\nWorld"), "Hello\nWorld");
    assert.equal(removalSeamNewlineDelta("Hello\n", "\nWorld"), 1);
  });

  it("preserves the larger author blank run", () => {
    assert.equal(joinRemovalSeam("Hello\n\n", "\n\nWorld"), "Hello\n\nWorld");
    assert.equal(removalSeamNewlineDelta("Hello\n\n", "\n\nWorld"), 2);
  });

  it("does not invent blanks when one side has none", () => {
    assert.equal(joinRemovalSeam("Hello", "World"), "HelloWorld");
    assert.equal(joinRemovalSeam("Hello\n\n", "World"), "Hello\n\nWorld");
  });
});
