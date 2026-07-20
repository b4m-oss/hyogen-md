import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it, vi } from "vitest";
import { build } from "../src/build/build.js";
import { buildDependencyGraph } from "../src/build/buildDependencyGraph.js";
import { createFsLoader } from "../src/io/createFsLoader.js";
import { renderClient } from "../src/renderClient.js";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.5",
);

describe("v0.5.0 integration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("glob + underscore filter: pages only; explicit include of partial", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-int-"));
    const root = path.join(fixtureRoot, "glob/doc-root");
    try {
      const result = await build({
        input: ["pages/*.md"],
        outDir,
        root,
      });
      const paths = result.files.map((f) => f.path).sort();
      assert.deepEqual(paths, ["pages/about.md", "pages/index.md"]);

      const withPartial = await build({
        input: ["_partials/header.md"],
        outDir: path.join(outDir, "explicit"),
        root,
      });
      assert.equal(withPartial.files.length, 1);
      assert.equal(withPartial.files[0]!.path, "_partials/header.md");
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("dependency graph walk discovers include/component/extend", async () => {
    const entry = path.join(fixtureRoot, "deps/entry.md");
    const graph = await buildDependencyGraph([entry], createFsLoader(), {
      root: path.join(fixtureRoot, "deps"),
    });
    const basenames = new Set(graph.nodes.map((n) => path.basename(n)));
    assert.ok(basenames.has("base.md"));
    assert.ok(basenames.has("included.md"));
    assert.ok(basenames.has("widget.md"));
    assert.ok(basenames.has("shared.md"));
  });

  it("serverContext expands in renderServer and build", async () => {
    const page = path.join(fixtureRoot, "server-context/page.md");
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(page, "utf8");
    const rendered = await renderServer(source, undefined, {
      serverContext: { secretKey: "SSR" },
    });
    assert.match(rendered.markdown, /SSR/);

    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-int-"));
    try {
      const result = await build({
        input: "page.md",
        outDir,
        root: path.join(fixtureRoot, "server-context"),
        serverContext: { secretKey: "BUILD" },
      });
      assert.match(result.files[0]!.markdown, /BUILD/);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("remote include expands via mock fetch", async () => {
    const remoteBody = "# From URL\n";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => remoteBody,
      })),
    );
    const { readFile } = await import("node:fs/promises");
    const parent = await readFile(
      path.join(fixtureRoot, "remote/parent-local.md"),
      "utf8",
    );
    const result = await renderServer(parent, undefined, {
      root: path.join(fixtureRoot, "remote"),
    });
    assert.match(result.markdown, /From URL/);
  });

  it("renderClient rejects serverContext", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, { serverContext: { a: 1 } } as never),
      (error: unknown) => {
        assertHyogenError(error, "server_context_on_client");
        return true;
      },
    );
  });
});
