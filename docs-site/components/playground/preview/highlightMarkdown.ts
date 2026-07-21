import hljs from "highlight.js/lib/core";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("markdown", markdown);

/** Highlight expanded Markdown source for the Preview pane Markdown tab. */
export function highlightMarkdown(source: string): string {
  return hljs.highlight(source, { language: "markdown" }).value;
}
