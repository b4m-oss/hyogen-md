import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { isUnderscorePartial } from "../../src/build/isUnderscorePartial.js";
import { collectEntryPaths } from "../../src/build/collectEntryPaths.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.5",
);

describe("isUnderscorePartial", () => {
  it("returns true for _meta.md", () => {
    assert.equal(isUnderscorePartial("_meta.md"), true);
  });

  it("returns true for files under _partials", () => {
    assert.equal(isUnderscorePartial("_partials/card.md"), true);
  });

  it("returns false for pages/index.md", () => {
    assert.equal(isUnderscorePartial("pages/index.md"), false);
  });

  it("returns true when basename starts with underscore", () => {
    // paths.md: `_` で始まるファイルは partial
    assert.equal(isUnderscorePartial("partials/_card.md"), true);
  });

  it("returns false for normal file under non-underscore dir", () => {
    assert.equal(isUnderscorePartial("partials/card.md"), false);
  });
});

describe("collectEntryPaths", () => {
  const underscoreRoot = path.join(fixtureRoot, "underscore");
  const globRoot = path.join(fixtureRoot, "glob/doc-root");

  it("returns one absolute path for a single file", async () => {
    const entries = await collectEntryPaths("pages/visible.md", {
      root: underscoreRoot,
    });
    assert.equal(entries.length, 1);
    assert.equal(entries[0], path.resolve(underscoreRoot, "pages/visible.md"));
  });

  it("expands pages/**/*.md glob", async () => {
    const entries = await collectEntryPaths("pages/**/*.md", {
      root: globRoot,
    });
    const rel = entries.map((e) => path.relative(globRoot, e).replace(/\\/g, "/")).sort();
    assert.deepEqual(rel, ["pages/about.md", "pages/index.md"]);
  });

  it("excludes _partials by default from broad globs", async () => {
    const entries = await collectEntryPaths("**/*.md", { root: globRoot });
    const rel = entries.map((e) => path.relative(globRoot, e).replace(/\\/g, "/"));
    assert.ok(!rel.some((r) => r.includes("_partials")));
    assert.ok(rel.includes("pages/index.md"));
  });

  it("includes explicit underscore path", async () => {
    const entries = await collectEntryPaths("_partials/hidden.md", {
      root: underscoreRoot,
    });
    assert.equal(entries.length, 1);
    assert.ok(entries[0]!.endsWith(`${path.sep}_partials${path.sep}hidden.md`));
  });

  it("includes underscore matches when includeUnderscoreEntries is true", async () => {
    const entries = await collectEntryPaths("**/*.md", {
      root: underscoreRoot,
      includeUnderscoreEntries: true,
    });
    const rel = entries.map((e) => path.relative(underscoreRoot, e).replace(/\\/g, "/"));
    assert.ok(rel.includes("_partials/hidden.md"));
    assert.ok(rel.includes("_hidden-dir/secret.md"));
  });

  it("uses options.root as glob cwd", async () => {
    const entries = await collectEntryPaths("pages/*.md", { root: globRoot });
    assert.equal(entries.length, 2);
  });

  it("returns empty array for empty glob matches", async () => {
    const entries = await collectEntryPaths("no-such-dir/**/*.md", {
      root: globRoot,
    });
    assert.deepEqual(entries, []);
  });

  it("throws file_not_found for missing literal path", async () => {
    await assert.rejects(
      () => collectEntryPaths("missing.md", { root: globRoot }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });
});
