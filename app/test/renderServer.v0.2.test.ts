import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "./helpers/v02Fixtures.js";

describe("renderServer v0.2", () => {
  it("keeps v0.1 string input behavior", async () => {
    const result = await renderServer("# Hello");
    assert.deepEqual(result, { markdown: "# Hello", warnings: [] });
  });

  it("renders from path input with doc root", async () => {
    const result = await renderServer({
      path: v02Path("doc-root/pages/index.md"),
    });
    assert.match(result.markdown, /Index/);
  });

  it("resolves root-relative include from path entry", async () => {
    const result = await renderServer({
      path: v02Path("doc-root/pages/with-include.md"),
    });
    assert.match(result.markdown, /Partial body from root-relative include/);
  });

  it("throws parse_error for root-relative include without doc root", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: v02Path("no-doc-root/page.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws forbidden_property_access for dangerous keys", async () => {
    await assert.rejects(
      () =>
        renderServer(
          readFileSync(v02Path("security/proto-access.md"), "utf8"),
          { obj: {} },
          { root: v02Path("security") },
        ),
      (error: unknown) => {
        assertHyogenError(error, "forbidden_property_access");
        return true;
      },
    );
  });
});

describe("v0.2 integration scenarios", () => {
  it("doc_root based include and component from path entry", async () => {
    const result = await renderServer({
      path: v02Path("doc-root/pages/full-integration.md"),
    });
    assert.match(result.markdown, /Partial body from root-relative include/);
    assert.match(result.markdown, /Hello, Ada!/);
  });

  it("emits prop warnings while continuing render", async () => {
    const source = [
      "<!--",
      "@hg",
      "component ../props/type-mismatch.md as item",
      "@endhg",
      "-->",
      '{{ item({ count: "bad", extra: "x" }) }}',
    ].join("\n");

    const result = await renderServer(source, undefined, {
      root: docRootFixtureDir,
      path: v02Path("doc-root/pages/index.md"),
    });

    assert.match(result.markdown, /Count:/);
    assert.ok(
      result.warnings.some((warning) => warning.code === "prop_type_mismatch"),
    );
    assert.ok(result.warnings.some((warning) => warning.code === "prop_unknown"));
  });

  it("skips circular include with warning", async () => {
    const result = await renderServer(
      readFileSync(v02Path("circular/a.md"), "utf8"),
      undefined,
      { root: v02Path("circular"), path: v02Path("circular/a.md") },
    );
    assert.match(result.markdown, /From A/);
    assert.match(result.markdown, /From B/);
    assert.ok(
      result.warnings.some((warning) => warning.code === "circular_include"),
    );
  });

  it("throws component_multiline_output for multiline component", async () => {
    const source = [
      "<!--",
      "@hg",
      "component /components/multiline.md as bad",
      "@endhg",
      "-->",
      "{{ bad({}) }}",
    ].join("\n");

    await assert.rejects(
      () =>
        renderServer(source, undefined, {
          root: docRootFixtureDir,
          path: v02Path("doc-root/pages/index.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "component_multiline_output");
        return true;
      },
    );
  });

  it("throws duplicate_component_alias", async () => {
    await assert.rejects(
      () =>
        renderServer({
          path: v02Path("alias/duplicate.md"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "duplicate_component_alias");
        return true;
      },
    );
  });
});
