import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderClient } from "../../src/renderClient.js";
import { renderServer } from "../../src/renderServer.js";
import type { Loader } from "../../src/types.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(testDir, "../fixtures");

function p(...parts: string[]): string {
  return path.join(fixtures, ...parts);
}

function createFsMapLoader(root: string): Loader {
  return async (filePath: string) => {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(root, filePath);
    return readFileSync(resolved, "utf8");
  };
}

describe("spec chapter smoke (v0.8)", () => {
  it("variables / front matter (v0.1)", async () => {
    const result = await renderServer({
      path: p("v0.1/frontmatter-basic.md"),
    });
    assert.match(result.markdown, /# Body/);
    assert.doesNotMatch(result.markdown, /^---/);
  });

  it("include (v0.1)", async () => {
    const result = await renderServer({
      path: p("v0.1/include-parent.md"),
    });
    assert.match(result.markdown, /Partial body content/);
  });

  it("component + props (v0.2)", async () => {
    const result = await renderServer({
      path: p("v0.2/doc-root/pages/full-integration.md"),
    });
    assert.match(result.markdown, /Hello, Ada!/);
  });

  it("paths / doc_root (v0.2)", async () => {
    const result = await renderServer({
      path: p("v0.2/doc-root/pages/with-include.md"),
    });
    assert.match(result.markdown, /Partial body from root-relative include/);
  });

  it("if / each (v0.3)", async () => {
    const light = await renderServer({
      path: p("v0.3/if-basic/light-status.md"),
    });
    assert.match(light.markdown, /full moon/);

    const fruits = await renderServer({
      path: p("v0.3/each/fruits-objects.md"),
    });
    assert.match(fruits.markdown, /apple is red/);
  });

  it("extend / block (v0.4)", async () => {
    const result = await renderServer({
      path: p("v0.4/basic/page.md"),
    });
    assert.match(result.markdown, /Paint here black all/);
  });

  it("build / serverContext (v0.5)", async () => {
    const result = await renderServer(
      { path: p("v0.5/server-context/page.md") },
      undefined,
      { serverContext: { secretKey: "from-server" } },
    );
    assert.match(result.markdown, /from-server/);
  });

  it("renderClient (v0.6)", async () => {
    const root = p("v0.6/loader");
    const result = await renderClient(
      { path: path.join(root, "page.md") },
      { title: "CSR" },
      { loader: createFsMapLoader(root), root },
    );
    assert.match(result.markdown, /# CSR/);
    assert.match(result.markdown, /Hello Ada/);
  });

  it("@@ / ternary / for / suspicious (v0.7)", async () => {
    const shorthand = await renderServer({
      path: p("v0.7/at-at/shorthand-include.md"),
    });
    assert.match(shorthand.markdown, /Included A\./);

    const ternary = await renderServer({
      path: p("v0.7/ternary/light-status.md"),
    });
    assert.match(ternary.markdown, /- Shine/);

    const forSum = await renderServer({
      path: p("v0.7/loops/for-sum.md"),
    });
    assert.match(forSum.markdown, /^3\s*$/m);

    const suspicious = await renderServer({
      path: p("v0.7/suspicious/script-in-context.md"),
    });
    assert.ok(
      suspicious.warnings.some((w) => w.code === "suspicious_context_value"),
    );
  });

  it("each + component (v0.8)", async () => {
    const result = await renderServer(
      { path: p("v0.8/each-component/cities.md") },
      { region: "Kansai" },
    );
    assert.match(result.markdown, /Name: Osaka/);
    assert.match(result.markdown, /Name: Kobe/);
  });
});
