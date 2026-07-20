import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "vitest";
import { resolveTemplatePath } from "../../src/paths/resolveTemplatePath.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "../helpers/v02Fixtures.js";

describe("resolveTemplatePath", () => {
  it("resolves root-relative path with doc root", () => {
    const resolved = resolveTemplatePath("/partials/header.md", {
      rootDir: docRootFixtureDir,
      fromPath: v02Path("doc-root/pages/index.md"),
    });
    assert.equal(resolved, path.join(docRootFixtureDir, "partials/header.md"));
  });

  it("resolves relative path from fromPath directory", () => {
    const fromPath = v02Path("doc-root/pages/index.md");
    const resolved = resolveTemplatePath("../partials/body.md", {
      rootDir: docRootFixtureDir,
      fromPath,
    });
    assert.equal(resolved, path.join(docRootFixtureDir, "partials/body.md"));
  });

  it("resolves sibling directory via parent segments", () => {
    const fromPath = v02Path("doc-root/pages/index.md");
    const resolved = resolveTemplatePath("../partials/body.md", {
      rootDir: docRootFixtureDir,
      fromPath,
    });
    assert.equal(resolved, path.join(docRootFixtureDir, "partials/body.md"));
  });

  it("throws parse_error for root-relative without doc root", () => {
    try {
      resolveTemplatePath("/foo.md", { documentPath: "page.md", hyogenPath: true });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error when resolved path escapes root with constrainToRoot", () => {
    try {
      resolveTemplatePath("../../outside.md", {
        rootDir: docRootFixtureDir,
        fromPath: v02Path("doc-root/pages/index.md"),
        constrainToRoot: true,
      });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("resolves missing path within root without throwing at resolve stage", () => {
    const resolved = resolveTemplatePath("/missing/file.md", {
      rootDir: docRootFixtureDir,
      fromPath: v02Path("doc-root/pages/index.md"),
      constrainToRoot: true,
    });
    assert.equal(resolved, path.join(docRootFixtureDir, "missing/file.md"));
  });

  it("throws parse_error for empty path", () => {
    try {
      resolveTemplatePath("", { rootDir: docRootFixtureDir });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
