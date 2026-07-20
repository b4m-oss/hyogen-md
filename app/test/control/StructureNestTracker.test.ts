import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { StructureNestTracker } from "../../src/control/StructureNestTracker.js";

describe("StructureNestTracker", () => {
  it("tracks enter and exit", () => {
    const tracker = new StructureNestTracker();
    assert.equal(tracker.currentDepth, 0);
    tracker.enter();
    assert.equal(tracker.currentDepth, 1);
    tracker.exit();
    assert.equal(tracker.currentDepth, 0);
  });

  it("allows depth up to 20", () => {
    const tracker = new StructureNestTracker();
    for (let i = 0; i < 20; i++) {
      const result = tracker.enter();
      assert.equal(result.exceeded, false);
    }
    assert.equal(tracker.currentDepth, 20);
  });

  it("reports exceeded at depth 21", () => {
    const tracker = new StructureNestTracker();
    for (let i = 0; i < 20; i++) tracker.enter();
    const result = tracker.enter();
    assert.equal(result.exceeded, true);
    if (result.exceeded) assert.equal(result.limit, 20);
  });
});
