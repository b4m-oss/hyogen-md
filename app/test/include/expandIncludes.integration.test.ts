import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expandIncludes } from "../../src/include/expandIncludes.js";
import { createFsLoader } from "../../src/io/createFsLoader.js";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.1",
);

describe("expandIncludes integration", () => {
  it("loads and expands fixture include-parent", async () => {
    const source = readFileSync(path.join(fixtureDir, "include-parent.md"), "utf8");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: createFsLoader(),
      root: fixtureDir,
    });
    assert.match(result, /Partial body content/);
  });
});
