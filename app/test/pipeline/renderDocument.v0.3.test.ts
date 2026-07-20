import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderDocument } from "../../src/pipeline/renderDocument.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.3",
);

function fixture(relativePath: string): string {
  return readFileSync(path.join(fixtureDir, relativePath), "utf8");
}

describe("renderDocument v0.3", () => {
  it("renders declaration, if, and interpolation end-to-end", async () => {
    const result = await renderDocument(fixture("if-basic/light-status.md"));
    assert.match(result.markdown, /Light Status/);
    assert.match(result.markdown, /full moon/);
    assert.doesNotMatch(result.markdown, /shiny sun/);
    assert.doesNotMatch(result.markdown, /@hg/);
  });

  it("renders each loop with interpolation", async () => {
    const result = await renderDocument(fixture("each/fruits-array.md"));
    assert.match(result.markdown, /- apple/);
    assert.match(result.markdown, /- banana/);
    assert.match(result.markdown, /- orange/);
  });

  it("throws parse_error for unclosed if before markdown output", async () => {
    await assert.rejects(
      () => renderDocument(fixture("unclosed-if/missing-endif.md")),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("aggregates nest_limit_exceeded warnings", async () => {
    const result = await renderDocument(fixture("nest-limit/depth-21-skip.md"));
    assert.ok(result.warnings.some((w) => w.code === "nest_limit_exceeded"));
  });
});
