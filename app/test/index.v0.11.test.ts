import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { loadDataSources } from "../src/index.js";

describe("index exports (v0.11)", () => {
  it("exports loadDataSources from the package entry", () => {
    assert.equal(typeof loadDataSources, "function");
  });
});
