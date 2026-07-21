import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dist");

describe("hyogen-md/client bundle (v0.6)", () => {
  it("emits client.js and client.d.ts", () => {
    assert.equal(existsSync(path.join(distDir, "client.js")), true);
    assert.equal(existsSync(path.join(distDir, "client.d.ts")), true);
  });

  it("does not include Node-only symbols in client.js", () => {
    const source = readFileSync(path.join(distDir, "client.js"), "utf8");
    assert.equal(source.includes("createFsLoader"), false);
    assert.equal(source.includes("createNodeLoader"), false);
    assert.equal(source.includes("loadDataSources"), false);
    assert.equal(source.includes("fast-glob"), false);
    assert.equal(source.includes("node:fs"), false);
    assert.equal(source.includes("renderServer"), false);
    assert.match(source, /renderClient/);
  });

  it("resolves renderClient from dist/client.js", async () => {
    const mod = await import("../dist/client.js");
    assert.equal(typeof mod.renderClient, "function");
    assert.equal(typeof mod.createHyogenError, "function");
    assert.equal(typeof mod.formatMessage, "function");
    assert.equal(typeof mod.formatDiagnosticLog, "function");
    assert.equal("build" in mod, false);
    assert.equal("renderServer" in mod, false);
  });
});
