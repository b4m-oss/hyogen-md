import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { loadDataSources } from "../../src/io/loadDataSources.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import type { Loader } from "../../src/types.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.11/data",
);

describe("loadDataSources (v0.11)", () => {
  it("loads a YAML file into context", async () => {
    const result = await loadDataSources(
      { site: "./site.yaml" },
      { root: fixtureDir },
    );
    assert.equal((result.site as { title?: string }).title, "Hyogen Site");
  });

  it("loads multiple data files", async () => {
    const result = await loadDataSources(
      {
        site: "./site.yaml",
        products: "./products.json",
      },
      { root: fixtureDir },
    );
    assert.equal((result.site as { title?: string }).title, "Hyogen Site");
    assert.equal((result.products as { count?: number }).count, 2);
  });

  it("loads top-level JSON arrays", async () => {
    const result = await loadDataSources(
      { items: "./items-array.json" },
      { root: fixtureDir },
    );
    assert.deepEqual(result.items, ["a", "b"]);
  });

  it("loads CSV files as object arrays", async () => {
    const result = await loadDataSources(
      { rows: "./rows.csv" },
      { root: fixtureDir },
    );
    assert.deepEqual(result.rows, [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ]);
  });

  it("returns an empty object for an empty map", async () => {
    const result = await loadDataSources({}, { root: fixtureDir });
    assert.deepEqual(result, {});
  });

  it("throws file_not_found for missing files", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { missing: "./missing.yaml" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws parse_error when file content is invalid", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { broken: "./invalid.json" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws load_failed when loader throws", async () => {
    const loader: Loader = async () => {
      throw new Error("boom");
    };

    await assert.rejects(
      () =>
        loadDataSources({ site: "./site.yaml" }, {
          root: fixtureDir,
          loader,
        }),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        return true;
      },
    );
  });
});
