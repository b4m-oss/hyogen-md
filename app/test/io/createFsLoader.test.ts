import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "vitest";
import { createFsLoader } from "../../src/io/createFsLoader.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("createFsLoader", () => {
  it("reads existing file contents", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-"));
    const filePath = path.join(dir, "test.md");
    await writeFile(filePath, "hello", "utf8");
    const loader = createFsLoader();
    assert.equal(await loader(filePath), "hello");
    await rm(dir, { recursive: true });
  });

  it("returns empty string for empty file", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-"));
    const filePath = path.join(dir, "empty.md");
    await writeFile(filePath, "", "utf8");
    const loader = createFsLoader();
    assert.equal(await loader(filePath), "");
    await rm(dir, { recursive: true });
  });

  it("reads UTF-8 Japanese text", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-"));
    const filePath = path.join(dir, "ja.md");
    await writeFile(filePath, "こんにちは", "utf8");
    const loader = createFsLoader();
    assert.equal(await loader(filePath), "こんにちは");
    await rm(dir, { recursive: true });
  });

  it("throws file_not_found for missing path", async () => {
    const loader = createFsLoader({ from: "./parent.md" });
    try {
      await loader(path.join(os.tmpdir(), "missing-hyogen-file.md"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "file_not_found");
      assert.equal((error as { details?: { via?: string } }).details?.via, "include");
    }
  });

  it("throws load_failed for directory path", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-"));
    const loader = createFsLoader();
    try {
      await loader(dir);
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "load_failed");
    }
    await rm(dir, { recursive: true });
  });
});
