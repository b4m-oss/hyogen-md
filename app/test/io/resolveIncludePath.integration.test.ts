import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveIncludePath } from "../../src/io/resolveIncludePath.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.1",
);

describe("resolveIncludePath integration", () => {
  it("resolves fixture partial path", () => {
    const resolved = resolveIncludePath(fixtureDir, "./partials/body.md");
    assert.equal(resolved, path.join(fixtureDir, "partials/body.md"));
  });
});
