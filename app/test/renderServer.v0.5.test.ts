import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { build } from "../src/build/build.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.5",
);

describe("renderServer serverContext (v0.5)", () => {
  it("exposes serverContext keys in templates", async () => {
    const result = await renderServer(
      "# {{ apiKey }}",
      { title: "public" },
      { serverContext: { apiKey: "secret" } },
    );
    assert.equal(result.markdown.trim(), "# secret");
  });

  it("lets serverContext win over context for same key", async () => {
    const result = await renderServer(
      "{{ name }}",
      { name: "public" },
      { serverContext: { name: "server" } },
    );
    assert.equal(result.markdown.trim(), "server");
  });

  it("works without serverContext (v0.4 regression)", async () => {
    const result = await renderServer("# {{ title }}", { title: "Hi" });
    assert.equal(result.markdown.trim(), "# Hi");
  });
});

describe("build serverContext (v0.5)", () => {
  it("applies serverContext when building entries", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-build-"));
    try {
      const root = path.join(fixtureDir, "server-context");
      const result = await build({
        input: ["page.md"],
        outDir,
        root,
        serverContext: { secretKey: "from-server", env: "prod" },
      });
      assert.equal(result.files.length, 1);
      assert.match(result.files[0]!.markdown, /from-server/);
      assert.ok(Array.isArray(result.warnings));
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});
