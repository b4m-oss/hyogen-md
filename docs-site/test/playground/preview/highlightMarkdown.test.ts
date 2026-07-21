import { describe, expect, it } from "vitest";
import { highlightMarkdown } from "../../../components/playground/preview/highlightMarkdown";

describe("highlightMarkdown", () => {
  it("wraps markdown headings in highlight spans", () => {
    const html = highlightMarkdown("# Hello\n\n- item\n");
    expect(html).toContain("hljs-");
    expect(html).toContain("Hello");
    expect(html).not.toContain("<script");
  });

  it("escapes raw HTML in source", () => {
    const html = highlightMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
