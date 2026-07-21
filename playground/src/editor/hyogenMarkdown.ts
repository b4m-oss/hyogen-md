import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import {
  defaultHighlightStyle,
  LRLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { parseMixed } from "@lezer/common";
import type { LRParser } from "@lezer/lr";
import type { Extension } from "@codemirror/state";
import {
  findHyogenDirectiveMarks,
  findHyogenRegions,
  findMustacheRegions,
} from "./findHyogenRegions";

const hyogenDirectiveMark = Decoration.mark({ class: "cm-hg-directive" });
const mustacheMark = Decoration.mark({ class: "cm-hg-mustache" });

function buildHyogenDirectiveDecorations(docText: string): DecorationSet {
  const ranges = findHyogenDirectiveMarks(docText).map((mark) =>
    hyogenDirectiveMark.range(mark.from, mark.to),
  );
  return Decoration.set(ranges, true);
}

function buildMustacheDecorations(docText: string): DecorationSet {
  const ranges = findMustacheRegions(docText).map((region) =>
    mustacheMark.range(region.from, region.to),
  );
  return Decoration.set(ranges, true);
}

const hyogenDirectiveHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildHyogenDirectiveDecorations(
        view.state.doc.toString(),
      );
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildHyogenDirectiveDecorations(
          update.state.doc.toString(),
        );
      }
    }
  },
  { decorations: (v) => v.decorations },
);

const mustacheHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildMustacheDecorations(view.state.doc.toString());
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildMustacheDecorations(
          update.state.doc.toString(),
        );
      }
    }
  },
  { decorations: (v) => v.decorations },
);

/** Soft red for `@hg` / `@endhg` / `@@` delimiters only. */
const hyogenDirectiveTheme = EditorView.baseTheme({
  ".cm-hg-directive": {
    color: "#c45c5c",
    backgroundColor: "color-mix(in srgb, #c45c5c 12%, transparent)",
    borderRadius: "2px",
  },
});

const mustacheTheme = EditorView.baseTheme({
  ".cm-hg-mustache": {
    color: "#0b6e4f",
    backgroundColor: "color-mix(in srgb, #0b6e4f 12%, transparent)",
    borderRadius: "2px",
  },
});

/**
 * Markdown + nested JS highlight for fence-outside `@hg`/`@@` regions,
 * plus light `{{ }}` decorations.
 */
export function hyogenMarkdown(): Extension {
  const mixedParser = (markdownLanguage.parser as LRParser).configure({
    wrap: parseMixed((node, input) => {
      if (!node.type.isTop) return null;
      const text = input.read(node.from, node.to);
      const regions = findHyogenRegions(text);
      if (!regions.length) return null;
      return {
        parser: javascriptLanguage.parser,
        overlay: regions.map((r) => ({
          from: node.from + r.from,
          to: node.from + r.to,
        })),
      };
    }),
  });

  const mixedMarkdown = LRLanguage.define({
    name: "hyogenMarkdown",
    parser: mixedParser,
  });

  return [
    markdown({ base: mixedMarkdown }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    hyogenDirectiveHighlight,
    hyogenDirectiveTheme,
    mustacheHighlight,
    mustacheTheme,
  ];
}
