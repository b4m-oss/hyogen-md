import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, it, vi } from "vitest";
import { createNodeLoader } from "../../src/io/createNodeLoader.js";
import { isRemotePath } from "../../src/io/isRemotePath.js";
import { renderServer } from "../../src/renderServer.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const remoteFixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.5/remote",
);

describe("isRemotePath", () => {
  it("returns true for https URLs", () => {
    assert.equal(isRemotePath("https://example.com/a.md"), true);
  });

  it("returns true for http URLs", () => {
    assert.equal(isRemotePath("http://127.0.0.1/x"), true);
  });

  it("returns false for local paths", () => {
    assert.equal(isRemotePath("./local.md"), false);
    assert.equal(isRemotePath("/abs.md"), false);
  });
});

describe("createNodeLoader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads local files like createFsLoader", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-node-"));
    const filePath = path.join(dir, "a.md");
    await writeFile(filePath, "local-body", "utf8");
    const loader = createNodeLoader();
    assert.equal(await loader(filePath), "local-body");
    await rm(dir, { recursive: true });
  });

  it("fetches https URLs via fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => "remote-text",
      })),
    );
    const loader = createNodeLoader();
    assert.equal(await loader("https://example.com/a.md"), "remote-text");
    assert.equal((fetch as ReturnType<typeof vi.fn>).mock.calls.length, 1);
  });

  it("expands remote include via renderServer with mock fetch", async () => {
    const remoteBody = await readFile(
      path.join(remoteFixture, "remote-body.md"),
      "utf8",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        assert.equal(url, "https://example.com/remote-body.md");
        return {
          ok: true,
          status: 200,
          text: async () => remoteBody,
        };
      }),
    );
    const parent = await readFile(
      path.join(remoteFixture, "parent-local.md"),
      "utf8",
    );
    const result = await renderServer(parent, undefined, {
      root: remoteFixture,
    });
    assert.match(result.markdown, /Remote body content/);
    assert.match(result.markdown, /Before/);
    assert.match(result.markdown, /After/);
  });

  it("throws file_not_found on fetch 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        text: async () => "not found",
      })),
    );
    const loader = createNodeLoader({ from: "./parent.md" });
    await assert.rejects(
      () => loader("https://example.com/missing.md"),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws load_failed on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const loader = createNodeLoader();
    await assert.rejects(
      () => loader("https://example.com/a.md"),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        return true;
      },
    );
  });

  it("throws file_not_found for missing local file", async () => {
    const loader = createNodeLoader();
    await assert.rejects(
      () => loader(path.join(os.tmpdir(), "no-such-hyogen-file.md")),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });
});

describe("remote path resolution bypass", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes remote include URL directly to loader", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        return { ok: true, status: 200, text: async () => "R" };
      }),
    );
    await renderServer(
      '<!--@hg\ninclude https://cdn.example/x.md\n@endhg-->',
      undefined,
      { root: remoteFixture },
    );
    assert.deepEqual(calls, ["https://cdn.example/x.md"]);
  });

  it("passes remote component URL directly to loader", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          text: async () => "---\nprops:\n  t:\n    type: string\n---\n{{ t }}",
        };
      }),
    );
    const result = await renderServer(
      [
        "<!--@hg",
        "component https://cdn.example/c.md as c",
        "@endhg-->",
        '{{ c({ t: "ok" }) }}',
      ].join("\n"),
      undefined,
      { root: remoteFixture },
    );
    assert.match(result.markdown, /ok/);
    assert.ok(calls.includes("https://cdn.example/c.md"));
  });

  it("passes remote extend URL directly to loader", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          text: async () =>
            [
              "<!--@hg",
              "block content",
              "@endhg-->",
              "L",
              "<!--@hg",
              "endblock",
              "@endhg-->",
            ].join("\n"),
        };
      }),
    );
    const result = await renderServer(
      [
        "<!--@hg",
        "extend https://cdn.example/layout.md",
        "@endhg-->",
        "<!--@hg",
        "block content",
        "@endhg-->",
        "Child",
        "<!--@hg",
        "endblock",
        "@endhg-->",
      ].join("\n"),
      undefined,
      { root: remoteFixture },
    );
    assert.match(result.markdown, /Child/);
    assert.ok(calls.includes("https://cdn.example/layout.md"));
  });
});
