import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter } from "../../src/frontmatter/parseFrontMatter.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.1",
);

describe("parseFrontMatter integration", () => {
  it("parses frontmatter-basic fixture", () => {
    const source = readFileSync(
      path.join(fixtureDir, "frontmatter-basic.md"),
      "utf8",
    );
    const result = parseFrontMatter(source);
    assert.equal(result.context.title, "Hello");
    assert.equal(result.body.trim(), "# Body");
  });
});
