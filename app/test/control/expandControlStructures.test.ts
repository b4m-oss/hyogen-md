import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandControlStructures } from "../../src/control/expandControlStructures.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

function hg(line: string): string {
  return `<!--@hg\n${line}\n@endhg-->`;
}

describe("expandControlStructures", () => {
  it("outputs true if branch body only without comments", async () => {
    const source = `${hg("if true")}Yes\n${hg("else")}No\n${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.equal(result, "Yes\n");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("outputs else branch body only when if is false", async () => {
    const source = `${hg("if false")}No\n${hg("else")}Yes\n${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.equal(result, "Yes\n");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("outputs empty when if is false and else is absent", async () => {
    const source = `${hg("if false")}No\n${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.equal(result.trim(), "");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("selects first matching else if branch body only", async () => {
    const source = [
      hg("if false"),
      "A",
      hg("else if true"),
      "B",
      hg("else"),
      "C",
      hg("endif"),
    ].join("");
    const result = await expandControlStructures(source, { context: {} });
    assert.equal(result, "B");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("keeps if opener/closer raw when preserveHgComments is true", async () => {
    const source = `${hg("if true")}Yes\n${hg("else")}No\n${hg("endif")}`;
    const result = await expandControlStructures(source, {
      context: {},
      preserveHgComments: true,
    });
    assert.match(result, /@hg/);
    assert.match(result, /Yes/);
    assert.doesNotMatch(result, /\nNo/);
  });

  it("expands each over array items as continuous list without comments", async () => {
    const source = `${hg("each name in features")}- {{ name }}\n${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { features: ["a", "b", "c"] },
    });
    assert.equal(result, "- a\n- b\n- c\n");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("chomps newline after each opener so list items stay continuous", async () => {
    const source = [hg("each name in features"), "- {{ name }}", hg("endeach")].join(
      "\n",
    );
    const result = await expandControlStructures(source, {
      context: { features: ["a", "b", "c"] },
    });
    assert.equal(result, "- a\n- b\n- c\n");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("expands each for a single item body only", async () => {
    const source = `${hg("each name in features")}- {{ name }}\n${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { features: ["solo"] },
    });
    assert.equal(result, "- solo\n");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("returns empty for empty each without comment residue", async () => {
    const source = `${hg("each item in data")}- x${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { data: [] },
    });
    assert.equal(result, "");
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("returns empty for non-iterable each without warning or comments", async () => {
    const source = `${hg("each item in data")}- x${hg("endeach")}`;
    const warnings: import("../../src/types.js").HyogenWarning[] = [];
    const result = await expandControlStructures(source, {
      context: { data: null },
      warnings,
    });
    assert.equal(result, "");
    assert.equal(warnings.length, 0);
    assert.doesNotMatch(result, /@hg|<!--/);
  });

  it("keeps each opener/closer raw when preserveHgComments is true", async () => {
    const source = `${hg("each name in features")}- {{ name }}\n${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { features: ["a", "b"] },
      preserveHgComments: true,
    });
    assert.match(result, /@hg/);
    assert.match(result, /a/);
    assert.match(result, /b/);
  });

  it("skips block at nest depth 21 with warning", async () => {
    let source = "";
    for (let i = 0; i < 21; i++) source += hg("if true") + "\n";
    source += "SKIP_ME\n";
    for (let i = 0; i < 21; i++) source += hg("endif") + "\n";

    const warnings: import("../../src/types.js").HyogenWarning[] = [];
    const result = await expandControlStructures(source, { context: {}, warnings });
    assert.doesNotMatch(result, /SKIP_ME/);
    assert.ok(warnings.some((w) => w.code === "nest_limit_exceeded"));
  });

  it("throws parse_error for invalid condition expression", async () => {
    const source = `${hg("if foo()")}X${hg("endif")}`;
    await assert.rejects(
      () => expandControlStructures(source, { context: {} }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
