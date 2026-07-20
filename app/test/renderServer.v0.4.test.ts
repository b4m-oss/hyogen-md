import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.4",
);

function fixturePath(relativePath: string): string {
  return path.join(fixtureDir, relativePath);
}

function fixture(relativePath: string): string {
  return readFileSync(fixturePath(relativePath), "utf8");
}

describe("renderServer v0.4 integration", () => {
  it("renders single inheritance + block override", async () => {
    const result = await renderServer({
      path: fixturePath("basic/page.md"),
    });

    assert.match(result.markdown, /# I like "Paint it black"/);
    assert.match(result.markdown, /Fill with black,\s*to make blank\./);
    assert.match(result.markdown, /Paint here black all\./);
    assert.match(result.markdown, /Copyright All rights reserved by example LLC\./);
    assert.doesNotMatch(result.markdown, /@hg/);
    assert.doesNotMatch(result.markdown, /block contents/);
    assert.doesNotMatch(result.markdown, /extend layout\.md/);
  });

  it("keeps layout defaults for blocks not overridden", async () => {
    const result = await renderServer({
      path: fixturePath("multi-block/page-partial-override.md"),
    });

    assert.match(result.markdown, /# Multi Title/);
    assert.match(result.markdown, /Overridden contents\./);
    assert.match(result.markdown, /Default sidebar\./);
    assert.doesNotMatch(result.markdown, /Default contents\./);
  });

  it("executes declarations in extend blocks", async () => {
    const result = await renderServer({
      path: fixturePath("extend-with-declarations/page-with-const.md"),
    });

    assert.match(result.markdown, /# From Extend/);
    assert.match(result.markdown, /Page contents: From Extend\./);
    assert.doesNotMatch(result.markdown, /Layout default:/);
  });

  it("mixes extend/block with v0.3 control structures", async () => {
    const result = await renderServer({
      path: fixturePath("with-logic/page-if-each.md"),
    });

    assert.match(result.markdown, /# Logic/);
    assert.match(result.markdown, /- night/);
    assert.doesNotMatch(result.markdown, /- day/);
    assert.match(result.markdown, /\* apple/);
    assert.match(result.markdown, /\* banana/);
    assert.doesNotMatch(result.markdown, /DEFAULT/);
  });

  it("warns and skips on circular extend", async () => {
    const result = await renderServer({
      path: fixturePath("circular/a-extends-b.md"),
    });

    assert.ok(result.warnings.some((w) => w.code === "circular_include"));
    assert.equal(result.markdown.trim(), "");
  });

  it("warns and skips extend inside a component", async () => {
    const result = await renderServer({
      path: fixturePath("component-extend/parent-calls-component.md"),
    });

    assert.ok(result.warnings.some((w) => w.code === "extend_in_component"));
    assert.equal(result.markdown.trim(), "Hello Ada.");
  });

  it("throws component_multiline_output when component extend outputs multiline", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: fixturePath(
            "component-extend/parent-calls-component-multiline.md",
          ),
        }),
      (error: unknown) => {
        assertHyogenError(error, "component_multiline_output");
        return true;
      },
    );
  });

  it("throws parse_error for duplicate block names in a child", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: fixturePath("duplicate-block/page-dup-contents.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for orphan/invalid extend position", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: fixturePath("extend-position/extend-not-first.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for unclosed blocks", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: fixturePath("unclosed-block/missing-endblock.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("resolves root-relative extend paths via .doc_root", async () => {
    const result = await renderServer({
      path: fixturePath("doc-root/pages/index.md"),
    });

    assert.match(result.markdown, /# Root Relative/);
    assert.match(result.markdown, /INDEX/);
  });
});

