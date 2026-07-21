import { describe, expect, it } from "vitest";
import {
  findHyogenDirectiveMarks,
  findHyogenRegions,
  findMustacheRegions,
} from "../../../components/playground/editor/findHyogenRegions";

describe("findHyogenRegions", () => {
  it("finds one multiline <!-- @hg … @endhg --> block", () => {
    const src = `Hello

<!--
@hg
const x = 1
@endhg
-->

World`;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(regions[0]!.kind).toBe("hg-block");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("@hg");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("@endhg");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("const x");
  });

  it("finds @@ shorthand as hg-short", () => {
    const src = `before <!--@@ const x = 1 @@--> after`;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(regions[0]!.kind).toBe("hg-short");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("const x");
  });

  it("returns regions in document order for two blocks", () => {
    const src = `<!--
@hg
const a = 1
@endhg
-->

<!--
@hg
const b = 2
@endhg
-->`;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(2);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("const a");
    expect(src.slice(regions[1]!.from, regions[1]!.to)).toContain("const b");
    expect(regions[0]!.from).toBeLessThan(regions[1]!.from);
  });

  it("ignores hyogen that appears only inside a code fence", () => {
    const src = `\`\`\`md
<!--
@hg
const x = 1
@endhg
-->
\`\`\``;
    expect(findHyogenRegions(src)).toEqual([]);
  });

  it("keeps fence-outside block and drops fence-inside block", () => {
    const src = `<!--
@hg
const outer = 1
@endhg
-->

\`\`\`
<!--
@hg
const inner = 2
@endhg
-->
\`\`\``;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("outer");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).not.toContain("inner");
  });

  it("returns empty for plain markdown without hyogen", () => {
    expect(findHyogenRegions("# Hello\n\nParagraph.")).toEqual([]);
  });

  it("drops incomplete @hg without @endhg", () => {
    const src = `<!--
@hg
const x = 1
-->`;
    expect(findHyogenRegions(src)).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(findHyogenRegions("")).toEqual([]);
  });
});

describe("findHyogenDirectiveMarks", () => {
  it("marks only @hg and @endhg", () => {
    const src = `<!--
@hg
const x = 1
@endhg
-->`;
    const marks = findHyogenDirectiveMarks(src);
    expect(marks).toHaveLength(2);
    expect(src.slice(marks[0]!.from, marks[0]!.to)).toBe("@hg");
    expect(src.slice(marks[1]!.from, marks[1]!.to)).toBe("@endhg");
  });

  it("marks both @@ delimiters for shorthand", () => {
    const src = `<!--@@ const x = 1 @@-->`;
    const marks = findHyogenDirectiveMarks(src);
    expect(marks).toHaveLength(2);
    expect(src.slice(marks[0]!.from, marks[0]!.to)).toBe("@@");
    expect(src.slice(marks[1]!.from, marks[1]!.to)).toBe("@@");
    expect(marks[0]!.from).toBeLessThan(marks[1]!.from);
  });
});

describe("findMustacheRegions", () => {
  it("finds {{ name }} outside fences", () => {
    const src = "Hello {{ name }}";
    const regions = findMustacheRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toBe("{{ name }}");
  });

  it("ignores mustache inside a code fence", () => {
    const src = "\`\`\`\n{{ name }}\n\`\`\`";
    expect(findMustacheRegions(src)).toEqual([]);
  });

  it("drops incomplete {{", () => {
    expect(findMustacheRegions("Hello {{ name")).toEqual([]);
  });
});
