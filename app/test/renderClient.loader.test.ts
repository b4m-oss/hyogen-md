import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, vi } from "vitest";
import { renderClient } from "../src/renderClient.js";
import type { Loader } from "../src/types.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.6/loader",
);

function createFsMapLoader(root: string): Loader {
  return async (filePath: string) => {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(root, filePath);
    return readFileSync(resolved, "utf8");
  };
}

describe("renderClient loader E2E (v0.6)", () => {
  it("resolves include and component via injected loader only", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch must not be called");
    });

    try {
      const pagePath = path.join(fixtureDir, "page.md");
      const loader = createFsMapLoader(fixtureDir);

      const result = await renderClient(
        { path: pagePath },
        { title: "CSR" },
        { loader, root: fixtureDir },
      );

      assert.match(result.markdown, /# CSR/);
      assert.match(result.markdown, /Body from partial/);
      assert.match(result.markdown, /Hello Ada/);
      assert.equal(fetchSpy.mock.calls.length, 0);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
