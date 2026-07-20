import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFsLoader } from "../../src/io/createFsLoader.js";
import { renderDocument } from "../../src/pipeline/renderDocument.js";
import { FRONTMATTER_SIZE_LIMIT } from "../../src/frontmatter/parseFrontMatter.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.1",
);

describe("renderDocument", () => {
  it("renders front matter variables in body", async () => {
    const result = await renderDocument("---\ntitle: T\n---\n# {{ title }}");
    assert.equal(result.markdown, "# T");
    assert.deepEqual(result.warnings, []);
  });

  it("renders include and variable expansion together", async () => {
    const source = readFileSync(path.join(fixtureDir, "include-parent.md"), "utf8");
    const result = await renderDocument(source, {
      loader: createFsLoader(),
      root: fixtureDir,
    });
    assert.match(result.markdown, /Partial body content/);
    assert.doesNotMatch(result.markdown, /@hg/);
  });

  it("honors preserveHgComments and preserveFrontMatter options", async () => {
    const source = "---\ntitle: T\n---\n<!--@hg\ninclude ./partials/body.md\n@endhg-->";
    const result = await renderDocument(source, {
      loader: createFsLoader(),
      root: fixtureDir,
      preserveHgComments: true,
      preserveFrontMatter: true,
    });
    assert.match(result.markdown, /^---\n/);
    assert.match(result.markdown, /@hg/);
  });

  it("throws parse_error for invalid YAML front matter", async () => {
    await assert.rejects(
      () => renderDocument("---\n: [\n---\n# Body"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws file_not_found for missing include target", async () => {
    const source = readFileSync(path.join(fixtureDir, "missing-include.md"), "utf8");
    await assert.rejects(
      () =>
        renderDocument(source, {
          loader: createFsLoader(),
          root: fixtureDir,
        }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws parse_error for invalid expressions", async () => {
    await assert.rejects(
      () => renderDocument("{{ foo() }}"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws frontmatter_too_large for oversized front matter", async () => {
    const yaml = "x: " + "a".repeat(FRONTMATTER_SIZE_LIMIT);
    await assert.rejects(
      () => renderDocument(`---\n${yaml}\n---\nbody`),
      (error: unknown) => {
        assertHyogenError(error, "frontmatter_too_large");
        return true;
      },
    );
  });
});
