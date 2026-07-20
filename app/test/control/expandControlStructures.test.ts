import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandControlStructures } from "../../src/control/expandControlStructures.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

function hg(line: string): string {
  return `<!--@hg\n${line}\n@endhg-->`;
}

describe("expandControlStructures", () => {
  it("outputs true if branch only", async () => {
    const source = `${hg("if true")}YES${hg("else")}NO${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.match(result, /YES/);
    assert.doesNotMatch(result, /\nNO/);
  });

  it("outputs else branch when if is false", async () => {
    const source = `${hg("if false")}NO${hg("else")}YES${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.match(result, /YES/);
  });

  it("selects first matching else if branch", async () => {
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
    assert.match(result, /B/);
    assert.doesNotMatch(result, /A/);
    assert.doesNotMatch(result, /C/);
  });

  it("expands each over array items", async () => {
    const source = `${hg("each item in data")}- {{ item }}\n${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { data: ["apple", "banana"] },
    });
    assert.match(result, /apple/);
    assert.match(result, /banana/);
  });

  it("returns empty for empty each", async () => {
    const source = `${hg("each item in data")}- x${hg("endeach")}`;
    const result = await expandControlStructures(source, {
      context: { data: [] },
    });
    assert.equal(result.trim(), "");
  });

  it("returns empty for non-iterable each without warning", async () => {
    const source = `${hg("each item in data")}- x${hg("endeach")}`;
    const warnings: import("../../src/types.js").HyogenWarning[] = [];
    const result = await expandControlStructures(source, {
      context: { data: null },
      warnings,
    });
    assert.equal(result.trim(), "");
    assert.equal(warnings.length, 0);
  });

  it("keeps control hg blocks in output for later strip", async () => {
    const source = `${hg("if true")}X${hg("endif")}`;
    const result = await expandControlStructures(source, { context: {} });
    assert.match(result, /@hg/);
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
