import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.3",
);

function fixture(relativePath: string): string {
  return readFileSync(path.join(fixtureDir, relativePath), "utf8");
}

describe("renderServer v0.3 integration", () => {
  it("renders if with else and else if branches", async () => {
    const light = await renderServer(fixture("if-basic/light-status.md"));
    assert.match(light.markdown, /full moon/);

    const grades = await renderServer(fixture("else-if/grades.md"));
    assert.match(grades.markdown, /Grade B/);
  });

  it("renders each for arrays and object arrays", async () => {
    const arrayResult = await renderServer(fixture("each/fruits-array.md"));
    assert.match(arrayResult.markdown, /- apple/);

    const objectResult = await renderServer(fixture("each/fruits-objects.md"));
    assert.match(objectResult.markdown, /apple is red/);
    assert.match(objectResult.markdown, /banana is yellow/);
  });

  it("renders nested if in each and each in if", async () => {
    const ifInEach = await renderServer(fixture("nested/if-in-each.md"));
    assert.match(ifInEach.markdown, /first: a/);
    assert.doesNotMatch(ifInEach.markdown, /first: b/);

    const eachInIf = await renderServer(fixture("nested/each-in-if.md"));
    assert.match(eachInIf.markdown, /- x/);
    assert.match(eachInIf.markdown, /- y/);
  });

  it("allows nest depth 20 and skips depth 21", async () => {
    const ok = await renderServer(fixture("nest-limit/depth-20-ok.md"));
    assert.match(ok.markdown, /DEPTH_OK/);
    assert.equal(ok.warnings.length, 0);

    const skip = await renderServer(fixture("nest-limit/depth-21-skip.md"));
    assert.doesNotMatch(skip.markdown, /SHOULD_SKIP/);
    assert.ok(skip.warnings.some((w) => w.code === "nest_limit_exceeded"));
  });

  it("executes declarations with const, let, and reassignment", async () => {
    const result = await renderServer(fixture("declarations/const-let.md"));
    assert.match(result.markdown, /- hello/);
    assert.match(result.markdown, /- updated/);
    assert.match(result.markdown, /duck is sitting/);
  });

  it("throws parse_error for unclosed if", async () => {
    await assert.rejects(
      () => renderServer(fixture("unclosed-if/missing-endif.md")),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("renders declarations and if/each in included child documents", async () => {
    const result = await renderServer(fixture("include-child/parent.md"), undefined, {
      root: path.join(fixtureDir, "include-child"),
    });
    assert.match(result.markdown, /Child says from child/);
  });
});
