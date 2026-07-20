import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.7",
);

function fixturePath(relativePath: string): string {
  return path.join(fixtureDir, relativePath);
}

function fixture(relativePath: string): string {
  return readFileSync(fixturePath(relativePath), "utf8");
}

describe("renderServer v0.7 integration", () => {
  it("renders @@ and @hg include equivalently", async () => {
    const shorthand = await renderServer({
      path: fixturePath("at-at/shorthand-include.md"),
    });
    const hg = await renderServer({
      path: fixturePath("at-at/equivalent-hg.md"),
    });
    assert.equal(shorthand.markdown.trim(), hg.markdown.trim());
    assert.match(shorthand.markdown, /Included A\./);
  });

  it("renders for-sum and do-while-count", async () => {
    const forSum = await renderServer({
      path: fixturePath("loops/for-sum.md"),
    });
    assert.match(forSum.markdown, /^3\s*$/m);

    const doWhile = await renderServer({
      path: fixturePath("loops/do-while-count.md"),
    });
    assert.match(doWhile.markdown, /^3\s*$/m);
  });

  it("renders ternary and template literal", async () => {
    const ternary = await renderServer({
      path: fixturePath("ternary/light-status.md"),
    });
    assert.match(ternary.markdown, /- Shine/);

    const greeting = await renderServer({
      path: fixturePath("template-literal/greeting.md"),
    });
    assert.match(greeting.markdown, /hello Ada/);
  });

  it("leaves fenced @hg / @@ untouched", async () => {
    const result = await renderServer({
      path: fixturePath("fence/fenced-hg.md"),
    });
    assert.match(result.markdown, /```[\s\S]*@hg[\s\S]*@endhg[\s\S]*```/);
    assert.match(result.markdown, /```[\s\S]*@@[\s\S]*@@[\s\S]*```/);
    assert.match(result.markdown, /Outside stays calm\./);
    assert.match(result.markdown, /const secret = 1/);
    assert.doesNotMatch(result.markdown, /Outside stays calm[\s\S]*\b1\b/);
  });

  it("warns suspicious_context_value and continues rendering", async () => {
    const result = await renderServer({
      path: fixturePath("suspicious/script-in-context.md"),
    });
    assert.ok(
      result.warnings.some((w) => w.code === "suspicious_context_value"),
    );
    assert.match(result.markdown, /<script>alert\(1\)<\/script>/);
  });

  it("applies toLocaleString in templates", async () => {
    const result = await renderServer({
      path: fixturePath("locale/population.md"),
    });
    assert.equal(
      result.markdown.trim(),
      (1234567).toLocaleString("ja-JP"),
    );
  });

  it("throws parse_error for mixed markers", async () => {
    await assert.rejects(
      () =>
        renderServer(
          "<!--@hg\nconst x = 1\n@@-->\n{{ x }}",
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for bare while", async () => {
    await assert.rejects(
      () =>
        renderServer(
          "<!--@hg\nlet x = 0\nwhile (x < 1) { x = x + 1 }\n@endhg-->\n{{ x }}",
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
