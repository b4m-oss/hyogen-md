import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createHyogenError } from "../../src/errors/createError.js";
import { expandIncludes } from "../../src/include/expandIncludes.js";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("expandIncludes", () => {
  it("replaces include marker with partial content", async () => {
    const source = "Before\n<!--@hg\ninclude ./partial.md\n@endhg-->\nAfter";
    const { source: marked, directives } = executeHgBlocks(source);
    const loader = async () => "Partial body";

    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader,
      root: "/tmp",
    });

    assert.match(result, /Before/);
    assert.match(result, /Partial body/);
    assert.match(result, /After/);
  });

  it("expands nested includes recursively", async () => {
    const files: Record<string, string> = {
      "/root/a.md": "<!--@hg\ninclude ./b.md\n@endhg-->",
      "/root/b.md": "<!--@hg\ninclude ./c.md\n@endhg-->",
      "/root/c.md": "deepest",
    };

    const { source: marked, directives } = executeHgBlocks(files["/root/a.md"]!);
    const loader = async (p: string) => files[p] ?? (() => { throw new Error("missing"); })();

    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader,
      root: "/root",
      path: "/root/a.md",
    });

    assert.equal(result.trim(), "deepest");
  });

  it("expands child hyogen include blocks recursively", async () => {
    const child = "<!--@hg\ninclude ./inner.md\n@endhg-->";
    const { source: marked, directives } = executeHgBlocks("<!--@hg\ninclude ./child.md\n@endhg-->");
    const loader = async (p: string) => {
      if (p.endsWith("child.md")) return child;
      if (p.endsWith("inner.md")) return "inner content";
      throw new Error("missing");
    };

    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader,
      root: "/root",
    });

    assert.equal(result.trim(), "inner content");
  });

  it("throws file_not_found when include target is missing", async () => {
    const { source: marked, directives } = executeHgBlocks(
      "<!--@hg\ninclude ./missing.md\n@endhg-->",
    );
    const loader = async () => {
      throw createHyogenError({
        code: "file_not_found",
        details: { path: "./missing.md", from: "./parent.md", via: "include" },
      });
    };

    try {
      await expandIncludes({
        source: marked,
        directives,
        context: {},
        loader,
        root: "/root",
      });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "file_not_found");
    }
  });

  it("throws parse_error when root is missing", async () => {
    const { source: marked, directives } = executeHgBlocks(
      "<!--@hg\ninclude ./a.md\n@endhg-->",
    );

    try {
      await expandIncludes({
        source: marked,
        directives,
        context: {},
        loader: async () => "x",
      });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("propagates load_failed from loader", async () => {
    const { source: marked, directives } = executeHgBlocks(
      "<!--@hg\ninclude ./a.md\n@endhg-->",
    );
    const loader = async () => {
      throw createHyogenError({
        code: "load_failed",
        details: { path: "./a.md", reason: "fail" },
      });
    };

    await assert.rejects(
      () =>
        expandIncludes({
          source: marked,
          directives,
          context: {},
          loader,
          root: "/root",
        }),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        return true;
      },
    );
  });
});
