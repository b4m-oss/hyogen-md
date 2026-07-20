import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderDocument } from "../../src/pipeline/renderDocument.js";
import { createFsLoader } from "../../src/io/createFsLoader.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.4",
);

function fixture(relativePath: string): { src: string; abs: string } {
  const abs = path.join(fixtureDir, relativePath);
  return { src: readFileSync(abs, "utf8"), abs };
}

describe("renderDocument v0.4", () => {
  it("resolves extend/block before other pipeline steps", async () => {
    const { src, abs } = fixture("basic/page.md");
    const loader = createFsLoader({ via: "extend" });

    const result = await renderDocument(src, {
      path: abs,
      loader,
    });

    assert.match(result.markdown, /# I like "Paint it black"/);
    assert.doesNotMatch(result.markdown, /@hg/);
    assert.doesNotMatch(result.markdown, /block contents/);
  });

  it("throws parse_error when extend appears not in the first hyogen block", async () => {
    const { src, abs } = fixture("extend-position/extend-not-first.md");
    const loader = createFsLoader({ via: "extend" });

    await assert.rejects(
      () => renderDocument(src, { path: abs, loader }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});

