import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { build } from "../../src/build/build.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.5",
);
const buildBasicRoot = path.join(fixtureRoot, "build-basic/doc-root");

describe("build", () => {
  it("renders a single entry and writes mirrored outDir path", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    try {
      const result = await build({
        input: ["pages/hello.md"],
        outDir,
        root: buildBasicRoot,
        context: { name: "World" },
      });
      assert.equal(result.files.length, 1);
      assert.equal(result.files[0]!.path, "pages/hello.md");
      assert.match(result.files[0]!.markdown, /Greetings!/);
      assert.match(result.files[0]!.markdown, /Hello World/);

      const written = await readFile(
        path.join(outDir, "pages/hello.md"),
        "utf8",
      );
      assert.equal(written, result.files[0]!.markdown);

      // partial must not be written as its own outDir file
      await assert.rejects(() =>
        access(path.join(outDir, "partials/greeting.md")),
      );
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("mirrors nested paths under outDir", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    try {
      const result = await build({
        input: ["pages/nested/a.md"],
        outDir,
        root: buildBasicRoot,
      });
      assert.equal(result.files[0]!.path, "pages/nested/a.md");
      await access(path.join(outDir, "pages/nested/a.md"));
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("builds multiple glob entries", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    try {
      const result = await build({
        input: ["pages/**/*.md"],
        outDir,
        root: buildBasicRoot,
        context: { name: "X" },
      });
      const paths = result.files.map((f) => f.path).sort();
      assert.deepEqual(paths, ["pages/hello.md", "pages/nested/a.md"]);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("applies context and serverContext together", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    try {
      const root = path.join(fixtureRoot, "server-context");
      const result = await build({
        input: "page.md",
        outDir,
        root,
        context: { secretKey: "ctx" },
        serverContext: { secretKey: "srv" },
      });
      assert.match(result.files[0]!.markdown, /srv/);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("aborts entire build on parse_error in an entry", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-bad-"));
    try {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(
        path.join(dir, "bad.md"),
        "<!--@hg\nnot_a_directive\n@endhg-->",
        "utf8",
      );
      await assert.rejects(
        () =>
          build({
            input: ["bad.md"],
            outDir,
            root: dir,
          }),
        (error: unknown) => {
          assertHyogenError(error, "parse_error");
          return true;
        },
      );
    } finally {
      await rm(outDir, { recursive: true, force: true });
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("throws load_failed when outDir is not writable", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-ro-"));
    try {
      // Use a path that cannot be created as a file parent (file as outDir)
      const blocker = path.join(dir, "blocker");
      const { writeFile } = await import("node:fs/promises");
      await writeFile(blocker, "x", "utf8");
      await assert.rejects(
        () =>
          build({
            input: ["pages/nested/a.md"],
            outDir: blocker,
            root: buildBasicRoot,
          }),
        (error: unknown) => {
          assertHyogenError(error, "load_failed");
          return true;
        },
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("throws file_not_found when dependency is missing", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-out-"));
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-miss-"));
    try {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(
        path.join(dir, "entry.md"),
        '<!--@hg\ninclude ./gone.md\n@endhg-->',
        "utf8",
      );
      await assert.rejects(
        () =>
          build({
            input: ["entry.md"],
            outDir,
            root: dir,
          }),
        (error: unknown) => {
          assertHyogenError(error, "file_not_found");
          return true;
        },
      );
    } finally {
      await rm(outDir, { recursive: true, force: true });
      await rm(dir, { recursive: true, force: true });
    }
  });
});
