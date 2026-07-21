import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { parseCsvFromString } from "../../src/io/parseCsvFromString.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.11/data",
);

async function fixture(name: string): Promise<string> {
  return readFile(path.join(fixtureDir, name), "utf8");
}

describe("parseCsvFromString (v0.11)", () => {
  it("parses simple comma-separated rows", async () => {
    const result = await parseCsvFromString("id,name\n1,Alpha\n2,Beta");
    assert.deepEqual(result, [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ]);
  });

  it("parses quoted fields containing commas", async () => {
    const source = await fixture("rows-quoted.csv");
    const result = await parseCsvFromString(source);
    assert.deepEqual(result, [
      { id: "1", label: "a,b" },
      { id: "2", label: "c" },
    ]);
  });

  it("parses CRLF line endings", async () => {
    const result = await parseCsvFromString("id,name\r\n1,Alpha\r\n2,Beta");
    assert.deepEqual(result, [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ]);
  });

  it("returns an empty array for header-only CSV", async () => {
    const result = await parseCsvFromString("id,name");
    assert.deepEqual(result, []);
  });

  it("throws parse_error when row column count mismatches", async () => {
    const source = await fixture("invalid.csv");
    await assert.rejects(
      () => parseCsvFromString(source, path.join(fixtureDir, "invalid.csv")),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for empty string", async () => {
    await assert.rejects(
      () => parseCsvFromString(""),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
