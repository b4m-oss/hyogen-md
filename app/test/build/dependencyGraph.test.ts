import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { collectDependencies } from "../../src/build/collectDependencies.js";
import { buildDependencyGraph } from "../../src/build/buildDependencyGraph.js";
import { createFsLoader } from "../../src/io/createFsLoader.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const depsRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.5/deps",
);

describe("collectDependencies", () => {
  it("collects include paths", () => {
    const deps = collectDependencies(
      '<!--@hg\ninclude ./partials/body.md\n@endhg-->',
    );
    assert.deepEqual(deps, [{ kind: "include", path: "./partials/body.md" }]);
  });

  it("collects component paths", () => {
    const deps = collectDependencies(
      '<!--@hg\ncomponent ./c.md as c\n@endhg-->',
    );
    assert.deepEqual(deps, [{ kind: "component", path: "./c.md" }]);
  });

  it("collects extend paths", () => {
    const deps = collectDependencies(
      '<!--@hg\nextend ./layouts/base.md\n@endhg-->',
    );
    assert.deepEqual(deps, [{ kind: "extend", path: "./layouts/base.md" }]);
  });

  it("lists multiple dependencies in appearance order", () => {
    const source = [
      "<!--@hg",
      "extend ./layouts/base.md",
      "@endhg-->",
      "<!--@hg",
      "include ./a.md",
      "@endhg-->",
      "<!--@hg",
      "component ./b.md as b",
      "@endhg-->",
    ].join("\n");
    const deps = collectDependencies(source);
    assert.deepEqual(
      deps.map((d) => d.kind),
      ["extend", "include", "component"],
    );
  });

  it("returns empty for if/each/const only", () => {
    const source = [
      "<!--@hg",
      "const x = 1",
      "@endhg-->",
      "<!--@hg",
      "if x",
      "@endhg-->",
      "yes",
      "<!--@hg",
      "endif",
      "@endhg-->",
    ].join("\n");
    assert.deepEqual(collectDependencies(source), []);
  });

  it("throws parse_error for broken hyogen", () => {
    assert.throws(
      () => collectDependencies("<!--@hg\ninclude\n@endhg-->"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});

describe("buildDependencyGraph", () => {
  it("includes entry and include target as nodes with one edge", async () => {
    const entry = path.join(depsRoot, "partials/included.md");
    // use a tiny parent that only includes
    const parentSource = '<!--@hg\ninclude ./included.md\n@endhg-->';
    const parentPath = path.join(depsRoot, "partials/__tmp_parent.md");
    const { writeFile, unlink } = await import("node:fs/promises");
    await writeFile(parentPath, parentSource, "utf8");
    try {
      const loader = createFsLoader();
      const graph = await buildDependencyGraph([parentPath], loader, {
        root: depsRoot,
      });
      assert.equal(graph.entries.length, 1);
      assert.equal(graph.edges.length, 1);
      assert.equal(graph.edges[0]!.kind, "include");
      assert.ok(graph.nodes.includes(path.resolve(entry)));
      assert.ok(graph.dependencies.includes(path.resolve(entry)));
    } finally {
      await unlink(parentPath);
    }
  });

  it("recursively adds layout includes from extend", async () => {
    const entry = path.join(depsRoot, "entry.md");
    const loader = createFsLoader();
    const graph = await buildDependencyGraph([entry], loader, {
      root: depsRoot,
    });

    const nodeBasenames = graph.nodes.map((n) => path.basename(n));
    assert.ok(nodeBasenames.includes("entry.md"));
    assert.ok(nodeBasenames.includes("base.md"));
    assert.ok(nodeBasenames.includes("shared.md"));
    assert.ok(nodeBasenames.includes("included.md"));
    assert.ok(nodeBasenames.includes("widget.md"));

    const kinds = new Set(graph.edges.map((e) => e.kind));
    assert.ok(kinds.has("extend"));
    assert.ok(kinds.has("include"));
    assert.ok(kinds.has("component"));
  });

  it("uses component file path as node (not alias)", async () => {
    const source = await readFile(path.join(depsRoot, "entry.md"), "utf8");
    const deps = collectDependencies(source);
    const component = deps.find((d) => d.kind === "component");
    assert.equal(component?.path, "./components/widget.md");
  });

  it("throws file_not_found for missing dependency", async () => {
    const { writeFile, unlink, mkdtemp } = await import("node:fs/promises");
    const os = await import("node:os");
    const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-dep-"));
    const entry = path.join(dir, "entry.md");
    await writeFile(
      entry,
      '<!--@hg\ninclude ./missing.md\n@endhg-->',
      "utf8",
    );
    const loader = createFsLoader();
    await assert.rejects(
      () => buildDependencyGraph([entry], loader, { root: dir }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
    await unlink(entry);
  });
});
