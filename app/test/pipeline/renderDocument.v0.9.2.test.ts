import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { renderDocument } from "../../src/pipeline/renderDocument.js";

function hg(line: string): string {
  return `<!--@hg\n${line}\n@endhg-->`;
}

describe("renderDocument v0.9.2 blank-line tightening", () => {
  it("renders each list items continuously without blank lines", async () => {
    const source = [
      "---",
      "features:",
      "  - a",
      "  - b",
      "  - c",
      "---",
      hg("each name in features"),
      "- {{ name }}",
      hg("endeach"),
    ].join("\n");

    const result = await renderDocument(source);
    assert.equal(result.markdown.trimEnd(), "- a\n- b\n- c");
    assert.doesNotMatch(result.markdown, /@hg|<!--/);
  });

  it("keeps author blank lines around each while tightening list interior", async () => {
    const source = [
      "Before",
      "",
      hg("each name in features"),
      "- {{ name }}",
      hg("endeach"),
      "",
      "After",
    ].join("\n");

    const result = await renderDocument(source, {
      context: { features: ["a", "b", "c"] },
    });
    assert.equal(result.markdown, "Before\n\n- a\n- b\n- c\n\nAfter");
  });

  it("does not insert extra blank paragraphs around short if body", async () => {
    const source = `Intro\n${hg("if true")}Yes\n${hg("endif")}Outro`;
    const result = await renderDocument(source);
    assert.equal(result.markdown, "Intro\nYes\nOutro");
    assert.doesNotMatch(result.markdown, /@hg|<!--/);
  });

  it("leaves control comments when preserveHgComments is true", async () => {
    const source = `${hg("if true")}Yes\n${hg("endif")}`;
    const result = await renderDocument(source, { preserveHgComments: true });
    assert.match(result.markdown, /@hg/);
    assert.match(result.markdown, /Yes/);
  });

  it("keeps at most one blank line between H1 and include body (demo-like)", async () => {
    const files: Record<string, string> = {
      "/src/index.md": [
        hg("extend ./layouts/base.md"),
        "",
        hg("block contents"),
        "",
        hg("component ./components/badge.md as badge"),
        "",
        hg("include ./partials/intro.md"),
        "",
        "## Features",
        "",
        hg("endblock"),
      ].join("\n"),
      "/src/layouts/base.md": [
        "# {{ title }} — {{ siteName }}",
        "",
        hg("block contents"),
        "(default)",
        hg("endblock"),
        "",
        "---",
        "region: {{ region }}",
        "",
      ].join("\n"),
      "/src/partials/intro.md": "This is the intro.\n",
      "/src/components/badge.md": [
        "---",
        "props:",
        "  label:",
        "    type: string",
        "    isRequired: true",
        "---",
        "`{{ label }}`",
        "",
      ].join("\n"),
    };

    const result = await renderDocument(files["/src/index.md"]!, {
      context: { title: "Welcome", siteName: "hyogen playground", region: "Kansai" },
      path: "/src/index.md",
      root: "/src",
      loader: async (abs) => {
        const content = files[abs];
        if (content == null) throw new Error(`missing ${abs}`);
        return content;
      },
    });

    assert.match(
      result.markdown,
      /^# Welcome — hyogen playground\n\nThis is the intro\.\n\n## Features\n/,
    );
    assert.doesNotMatch(result.markdown, /\n{3,}/);
  });

  it("preserves author double blank between H1 and following content", async () => {
    const source = ["# Title", "", "", "Para"].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "# Title\n\n\nPara");
  });
});
