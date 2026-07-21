import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { ensureSyntaxTree } from "@codemirror/language";
import { hyogenMarkdown } from "../../src/editor/hyogenMarkdown";
import { applyDemoSeed } from "../../src/seed/demoSeed";
import { VirtualFs } from "../../src/fs/virtualFs";

describe("hyogenMarkdown editor smoke", () => {
  it("creates EditorState for demo index.md", () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);
    const doc = fs.read("/src/index.md");
    const state = EditorState.create({
      doc,
      extensions: [hyogenMarkdown()],
    });
    expect(state.doc.lines).toBeGreaterThan(10);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).toBeTruthy();
  });
});
