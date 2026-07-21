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
  syntaxHighlighting,
  type LRLanguage,
} from "@codemirror/language";
import { parseMixed } from "@lezer/common";
import type { Extension } from "@codemirror/state";
import {
  findHyogenRegions,
  findMustacheRegions,
} from "./findHyogenRegions";

const mustacheMark = Decoration.mark({ class: "cm-hg-mustache" });

function buildMustacheDecorations(docText: string): DecorationSet {
  const ranges = findMustacheRegions(docText).map((region) =>
    mustacheMark.range(region.from, region.to),
  );
  return Decoration.set(ranges, true);
}

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
  // markdownLanguage is defined as LRLanguage; public type is Language.
  const mixedMarkdown = (markdownLanguage as LRLanguage).configure({
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

  return [
    markdown({ base: mixedMarkdown }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    mustacheHighlight,
    mustacheTheme,
  ];
}
