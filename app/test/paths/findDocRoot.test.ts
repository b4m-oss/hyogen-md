import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "vitest";
import { findDocRoot } from "../../src/paths/findDocRoot.js";
import { docRootFixtureDir, v02Path } from "../helpers/v02Fixtures.js";

describe("findDocRoot", () => {
  it("finds doc root from nested page file", () => {
    const start = v02Path("doc-root/pages/index.md");
    assert.equal(findDocRoot(start), docRootFixtureDir);
  });

  it("finds doc root when start directory contains marker", () => {
    assert.equal(findDocRoot(docRootFixtureDir), docRootFixtureDir);
  });

  it("finds doc root from deeply nested path", () => {
    const deep = v02Path("doc-root/pages/nested/deep.md");
    assert.equal(findDocRoot(deep), docRootFixtureDir);
  });

  it("returns undefined when no doc root exists", () => {
    assert.equal(findDocRoot(v02Path("no-doc-root/page.md")), undefined);
  });

  it("searches from parent when start path is a file", () => {
    const file = v02Path("doc-root/pages/index.md");
    assert.equal(findDocRoot(file), docRootFixtureDir);
  });

  it("returns undefined at filesystem boundary", () => {
    assert.equal(findDocRoot(path.parse("/").root), undefined);
  });
});
