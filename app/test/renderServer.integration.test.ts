import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderServer } from "../src/index.js";

describe("renderServer integration", () => {
  it("is exported from package entry", async () => {
    const result = await renderServer("# Exported");
    assert.equal(result.markdown, "# Exported");
  });
});
