import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";
import { docRootFixtureDir, v02Path } from "./helpers/v02Fixtures.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.8",
);

function fixturePath(relativePath: string): string {
  return path.join(fixtureDir, relativePath);
}

describe("renderServer v0.8 each + component", () => {
  it("passes loop variables into component props", async () => {
    const result = await renderServer(
      { path: fixturePath("each-component/cities.md") },
      { region: "Kansai" },
    );

    assert.match(result.markdown, /# City list/);
    assert.match(
      result.markdown,
      /Name: Osaka \/ Population: 2,825,000 \(Kansai\)/,
    );
    assert.match(
      result.markdown,
      /Name: Kobe \/ Population: 1,490,000 \(Kansai\)/,
    );
    assert.equal(result.warnings.length, 0);
  });

  it("exposes parent context inside component (existing scope)", async () => {
    const result = await renderServer(
      { path: fixturePath("each-component/cities.md") },
      { region: "Kinki" },
    );
    assert.match(result.markdown, /\(Kinki\)/);
    assert.doesNotMatch(result.markdown, /\(Kansai\)/);
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
});
