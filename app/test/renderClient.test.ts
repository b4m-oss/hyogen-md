import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderClient } from "../src/renderClient.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";
import type { Loader } from "../src/types.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.6/loader",
);

function createMapLoader(map: Record<string, string>): Loader {
  return async (filePath: string) => {
    const key = path.normalize(filePath);
    for (const [k, v] of Object.entries(map)) {
      if (path.normalize(k) === key || key.endsWith(path.normalize(k))) {
        return v;
      }
    }
    throw new Error(`missing: ${filePath}`);
  };
}

describe("renderClient (v0.6)", () => {
  it("throws server_context_on_client when serverContext is passed", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, {
          serverContext: { x: 1 },
          loader: async () => "# x",
        } as never),
      (error: unknown) => {
        assertHyogenError(error, "server_context_on_client");
        return true;
      },
    );
  });

  it("checks serverContext before loader required", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, {
          serverContext: { x: 1 },
        } as never),
      (error: unknown) => {
        assertHyogenError(error, "server_context_on_client");
        return true;
      },
    );
  });

  it("throws parse_error when loader is missing", async () => {
    await assert.rejects(
      () => renderClient("# Hi", {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("renders a string source with no dependencies", async () => {
    const result = await renderClient("# Hello {{ name }}", { name: "World" }, {
      loader: async () => {
        throw new Error("loader should not be called");
      },
    });
    assert.match(result.markdown, /# Hello World/);
  });

  it("loads { path } via injected loader", async () => {
    const entry = "/virtual/page.md";
    const loader = createMapLoader({
      [entry]: "---\ntitle: FromPath\n---\n# {{ title }}",
    });
    const result = await renderClient({ path: entry }, undefined, { loader });
    assert.match(result.markdown, /# FromPath/);
  });

  it("propagates options.root for relative includes", async () => {
    const pagePath = path.join(fixtureDir, "page.md");
    const bodyPath = path.join(fixtureDir, "partials/body.md");
    const greetPath = path.join(fixtureDir, "components/greet.md");

    const sources: Record<string, string> = {
      [pagePath]: [
        '<!--@hg',
        'component ./components/greet.md as greet',
        '@endhg-->',
        "",
        "# {{ title }}",
        "",
        "<!--@hg",
        "include ./partials/body.md",
        "@endhg-->",
        "",
        '- {{ greet({ name: "Ada" }) }}',
      ].join("\n"),
      [bodyPath]: "Body from partial.",
      [greetPath]:
        "---\nprops:\n  name:\n    type: string\n    isRequired: true\n---\nHello {{ name }}",
    };

    const loader: Loader = async (p) => {
      const normalized = path.resolve(p);
      const hit = sources[normalized];
      if (!hit) {
        throw Object.assign(new Error(`missing ${p}`), { code: "ENOENT" });
      }
      return hit;
    };

    const result = await renderClient(
      { path: pagePath },
      { title: "Page" },
      { loader, root: fixtureDir },
    );

    assert.match(result.markdown, /# Page/);
    assert.match(result.markdown, /Body from partial/);
    assert.match(result.markdown, /Hello Ada/);
  });
});
