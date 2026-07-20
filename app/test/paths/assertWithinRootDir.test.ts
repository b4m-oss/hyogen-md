import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "vitest";
import { assertWithinRootDir } from "../../src/paths/assertWithinRootDir.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "../helpers/v02Fixtures.js";

describe("assertWithinRootDir", () => {
  it("allows files inside root", () => {
    assert.doesNotThrow(() =>
      assertWithinRootDir(
        v02Path("doc-root/partials/body.md"),
        docRootFixtureDir,
      ),
    );
  });

  it("allows symlinks pointing inside root", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "hyogen-symlink-"));
    try {
      const root = path.join(tempDir, "root");
      const target = path.join(root, "target.md");
      const link = path.join(root, "link.md");
      mkdirSync(root, { recursive: true });
      writeFileSync(target, "content");
      symlinkSync(target, link);
      assert.doesNotThrow(() => assertWithinRootDir(link, root));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects symlinks pointing outside root", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "hyogen-symlink-out-"));
    try {
      const root = path.join(tempDir, "root");
      const outside = path.join(tempDir, "outside.md");
      const link = path.join(root, "link.md");
      mkdirSync(root, { recursive: true });
      writeFileSync(outside, "outside");
      symlinkSync(outside, link);
      try {
        assertWithinRootDir(link, root);
        assert.fail("expected throw");
      } catch (error) {
        assertHyogenError(error, "parse_error");
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects normalized paths outside root", () => {
    try {
      assertWithinRootDir(
        path.resolve(docRootFixtureDir, "../outside.md"),
        docRootFixtureDir,
      );
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws file_not_found for missing paths within root", () => {
    try {
      assertWithinRootDir(
        path.join(docRootFixtureDir, "missing.md"),
        docRootFixtureDir,
      );
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "file_not_found");
    }
  });
});
