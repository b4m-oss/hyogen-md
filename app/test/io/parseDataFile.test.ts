import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { parseDataFile } from "../../src/io/parseDataFile.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.11/data",
);

async function fixture(name: string): Promise<string> {
  return readFile(path.join(fixtureDir, name), "utf8");
}

describe("parseDataFile (v0.11)", () => {
  it("parses YAML objects", async () => {
    const source = await fixture("site.yaml");
    const result = await parseDataFile(source, "site.yaml");
    assert.equal((result as { title?: string }).title, "Hyogen Site");
    assert.deepEqual((result as { nav?: string[] }).nav, ["Home", "Docs"]);
  });

  it("parses JSON objects", async () => {
    const source = await fixture("products.json");
    const result = await parseDataFile(source, "products.json");
    assert.equal((result as { count?: number }).count, 2);
    assert.equal(
      (result as { items?: { sku: string }[] }).items?.[0]?.sku,
      "A1",
    );
  });

  it("parses top-level JSON arrays", async () => {
    const source = await fixture("items-array.json");
    const result = await parseDataFile(source, "items-array.json");
    assert.deepEqual(result, ["a", "b"]);
  });

  it("parses CSV files into object arrays", async () => {
    const source = await fixture("rows.csv");
    const result = await parseDataFile(source, "rows.csv");
    assert.deepEqual(result, [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ]);
  });

  it("matches extensions case-insensitively", async () => {
    const source = await fixture("site.yaml");
    const result = await parseDataFile(source, "site.YAML");
    assert.equal((result as { title?: string }).title, "Hyogen Site");
  });

  it("throws parse_error for invalid JSON", async () => {
    const source = await fixture("invalid.json");
    await assert.rejects(
      () => parseDataFile(source, "invalid.json"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for invalid YAML", async () => {
    const source = await fixture("invalid.yaml");
    await assert.rejects(
      () => parseDataFile(source, "invalid.yaml"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for invalid CSV", async () => {
    const source = await fixture("invalid.csv");
    await assert.rejects(
      () => parseDataFile(source, "invalid.csv"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for unsupported extensions", async () => {
    const source = await fixture("unknown.txt");
    await assert.rejects(
      () => parseDataFile(source, "unknown.txt"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        assert.equal((error as { details?: { format?: string } }).details?.format, "txt");
        return true;
      },
    );
  });

  it("throws parse_error for empty files", async () => {
    const source = await fixture("empty.json");
    await assert.rejects(
      () => parseDataFile(source, "empty.json"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
