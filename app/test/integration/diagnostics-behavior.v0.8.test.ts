import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../../src/renderServer.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "../helpers/v02Fixtures.js";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures",
);

function p(...parts: string[]): string {
  return path.join(fixtures, ...parts);
}

describe("diagnostics behavior (v0.8): warnings continue", () => {
  it("circular_include returns markdown + warning", async () => {
    const result = await renderServer(
      readFileSync(v02Path("circular/a.md"), "utf8"),
      undefined,
      { root: v02Path("circular"), path: v02Path("circular/a.md") },
    );
    assert.match(result.markdown, /From A/);
    assert.ok(result.warnings.some((w) => w.code === "circular_include"));
  });

  it("suspicious_context_value returns markdown + warning", async () => {
    const result = await renderServer({
      path: p("v0.7/suspicious/script-in-context.md"),
    });
    assert.match(result.markdown, /<script>/);
    assert.ok(
      result.warnings.some((w) => w.code === "suspicious_context_value"),
    );
  });

  it("prop_type_mismatch returns markdown + warning", async () => {
    const source = [
      "<!--",
      "@hg",
      "component ../props/type-mismatch.md as item",
      "@endhg",
      "-->",
      '{{ item({ count: "bad" }) }}',
    ].join("\n");

    const result = await renderServer(source, undefined, {
      root: docRootFixtureDir,
      path: v02Path("doc-root/pages/index.md"),
    });
    assert.match(result.markdown, /Count:/);
    assert.ok(result.warnings.some((w) => w.code === "prop_type_mismatch"));
  });

  it("nest_limit_exceeded returns markdown + warning", async () => {
    const result = await renderServer({
      path: p("v0.3/nest-limit/depth-21-skip.md"),
    });
    assert.ok(typeof result.markdown === "string");
    assert.ok(result.warnings.some((w) => w.code === "nest_limit_exceeded"));
  });
});

describe("diagnostics behavior (v0.8): errors abort", () => {
  it("parse_error rejects without partial success", async () => {
    await assert.rejects(
      () => renderServer(readFileSync(p("v0.1/invalid-hg.md"), "utf8")),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        assert.equal(
          "markdown" in (error as object),
          false,
          "error must not carry partial markdown",
        );
        return true;
      },
    );
  });

  it("file_not_found rejects without partial success", async () => {
    await assert.rejects(
      () =>
        renderServer(readFileSync(p("v0.1/missing-include.md"), "utf8"), undefined, {
          root: p("v0.1"),
        }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        assert.equal("markdown" in (error as object), false);
        return true;
      },
    );
  });

  it("forbidden_property_access rejects without partial success", async () => {
    await assert.rejects(
      () =>
        renderServer(
          readFileSync(v02Path("security/proto-access.md"), "utf8"),
          { obj: {} },
          { root: v02Path("security") },
        ),
      (error: unknown) => {
        assertHyogenError(error, "forbidden_property_access");
        assert.equal("markdown" in (error as object), false);
        return true;
      },
    );
  });
});
