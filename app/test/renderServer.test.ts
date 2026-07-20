import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderServer } from "../src/renderServer.js";
import { FRONTMATTER_SIZE_LIMIT } from "../src/frontmatter/parseFrontMatter.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.1",
);

describe("renderServer", () => {
  it("renders minimal markdown source", async () => {
    const result = await renderServer("# Hello");
    assert.deepEqual(result, { markdown: "# Hello", warnings: [] });
  });

  it("merges context with front matter using later-wins semantics", async () => {
    const result = await renderServer(
      "---\ntitle: FM\n---\n# {{ title }}",
      { title: "API" },
      { serverContext: { subtitle: "S" } },
    );
    assert.equal(result.markdown, "# FM");
  });

  it("resolves relative includes when options.root is set", async () => {
    const source = readFileSync(path.join(fixtureDir, "include-parent.md"), "utf8");
    const result = await renderServer(source, undefined, { root: fixtureDir });
    assert.match(result.markdown, /Partial body content/);
  });

  it("returns empty markdown for empty source", async () => {
    const result = await renderServer("");
    assert.equal(result.markdown, "");
  });

  it("throws parse_error for relative include without root", async () => {
    const source = readFileSync(path.join(fixtureDir, "include-parent.md"), "utf8");
    await assert.rejects(
      () => renderServer(source),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("propagates HyogenError from renderDocument", async () => {
    await assert.rejects(
      () => renderServer("<!--@hg\nconst x = 1\n@endhg-->"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});

describe("renderServer end-to-end scenarios", () => {
  it("front matter to variable expansion", async () => {
    const result = await renderServer("---\ntitle: My Page\n---\n# {{ title }}");
    assert.equal(result.markdown, "# My Page");
  });

  it("simple include embedding", async () => {
    const source = readFileSync(path.join(fixtureDir, "include-parent.md"), "utf8");
    const result = await renderServer(source, undefined, { root: fixtureDir });
    assert.match(result.markdown, /Partial body content/);
  });

  it("default pipe fallback", async () => {
    const source = readFileSync(path.join(fixtureDir, "default-pipe.md"), "utf8");
    const result = await renderServer(source);
    assert.equal(result.markdown.trim(), "fallback");
  });

  it("invalid DSL yields parse_error", async () => {
    const source = readFileSync(path.join(fixtureDir, "invalid-hg.md"), "utf8");
    await assert.rejects(
      () => renderServer(source),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("missing include yields file_not_found", async () => {
    const source = readFileSync(path.join(fixtureDir, "missing-include.md"), "utf8");
    await assert.rejects(
      () => renderServer(source, undefined, { root: fixtureDir }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("oversized front matter yields frontmatter_too_large", async () => {
    const yaml = "x: " + "a".repeat(FRONTMATTER_SIZE_LIMIT);
    await assert.rejects(
      () => renderServer(`---\n${yaml}\n---\nbody`),
      (error: unknown) => {
        assertHyogenError(error, "frontmatter_too_large");
        return true;
      },
    );
  });
});
