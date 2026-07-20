import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFsLoader } from "../../src/io/createFsLoader.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.1",
);

describe("createFsLoader integration", () => {
  it("loads fixture file through resolveIncludePath target", async () => {
    const loader = createFsLoader();
    const filePath = path.join(fixtureDir, "partials/body.md");
    const expected = readFileSync(filePath, "utf8");
    assert.equal(await loader(filePath), expected);
  });
});
