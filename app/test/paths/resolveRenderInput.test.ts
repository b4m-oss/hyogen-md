import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { resolveRenderInput } from "../../src/paths/resolveRenderInput.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "../helpers/v02Fixtures.js";

describe("resolveRenderInput", () => {
  it("returns string input unchanged", async () => {
    const result = await resolveRenderInput("# Hello");
    assert.deepEqual(result, { source: "# Hello", rootDir: undefined });
  });

  it("loads file and discovers doc root from path input", async () => {
    const result = await resolveRenderInput({
      path: v02Path("doc-root/pages/index.md"),
    });
    assert.match(result.source, /Index/);
    assert.equal(result.rootDir, docRootFixtureDir);
    assert.equal(result.entryPath, v02Path("doc-root/pages/index.md"));
  });

  it("uses options.root override", async () => {
    const customRoot = v02Path("doc-root");
    const result = await resolveRenderInput(
      { path: v02Path("doc-root/pages/index.md") },
      { root: customRoot },
    );
    assert.equal(result.rootDir, customRoot);
  });

  it("throws file_not_found for missing path", async () => {
    await assert.rejects(
      () => resolveRenderInput({ path: v02Path("doc-root/missing.md") }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws parse_error when path is a directory", async () => {
    await assert.rejects(
      () => resolveRenderInput({ path: docRootFixtureDir }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
