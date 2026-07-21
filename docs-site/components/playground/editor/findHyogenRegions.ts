export type HyogenRegionKind = "hg-block" | "hg-short";

export type TextRegion = {
  from: number;
  to: number;
  kind: HyogenRegionKind;
};

export type MustacheRegion = {
  from: number;
  to: number;
};

/** Opener / closer tokens only (`@hg`, `@endhg`, `@@`). */
export type HyogenDirectiveMark = {
  from: number;
  to: number;
};

type Span = { from: number; to: number };

/** Half-open fence spans (opening ``` through closing ```). Unclosed → EOF. */
export function findFenceRanges(source: string): Span[] {
  const ranges: Span[] = [];
  const lineRe = /^```[^\n]*$/gm;
  let open: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(source))) {
    if (open == null) {
      open = m.index;
    } else {
      ranges.push({ from: open, to: m.index + m[0].length });
      open = null;
    }
  }
  if (open != null) {
    ranges.push({ from: open, to: source.length });
  }
  return ranges;
}

function overlapsFence(from: number, to: number, fences: Span[]): boolean {
  return fences.some((f) => from < f.to && to > f.from);
}

/**
 * Highlight targets for `@hg`…`@endhg` and `@@`…`@@` outside code fences.
 * Incomplete blocks are dropped. Markers are included in the span.
 */
export function findHyogenRegions(source: string): TextRegion[] {
  if (!source) return [];

  const fences = findFenceRanges(source);
  const regions: TextRegion[] = [];
  const re = /@hg\b[\s\S]*?@endhg|@@[\s\S]*?@@/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(source))) {
    const from = m.index;
    const to = from + m[0].length;
    if (overlapsFence(from, to, fences)) continue;

    const kind: HyogenRegionKind = m[0].startsWith("@hg")
      ? "hg-block"
      : "hg-short";
    regions.push({ from, to, kind });
  }

  return regions;
}

/**
 * Start/end directive tokens for each fence-outside hyogen region
 * (`@hg` + `@endhg`, or opening/closing `@@`).
 */
export function findHyogenDirectiveMarks(
  source: string,
): HyogenDirectiveMark[] {
  const marks: HyogenDirectiveMark[] = [];
  for (const region of findHyogenRegions(source)) {
    if (region.kind === "hg-block") {
      marks.push({ from: region.from, to: region.from + "@hg".length });
      marks.push({ from: region.to - "@endhg".length, to: region.to });
    } else {
      marks.push({ from: region.from, to: region.from + "@@".length });
      marks.push({ from: region.to - "@@".length, to: region.to });
    }
  }
  return marks;
}

/**
 * Fence-outside `{{ … }}` / `{{{ … }}}` spans. Incomplete openers are dropped.
 */
export function findMustacheRegions(source: string): MustacheRegion[] {
  if (!source) return [];

  const fences = findFenceRanges(source);
  const regions: MustacheRegion[] = [];
  // Triple first so {{{ }}} is not split into {{ + stray }
  const re = /\{\{\{[\s\S]*?\}\}\}|\{\{[^{][\s\S]*?\}\}/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(source))) {
    const from = m.index;
    const to = from + m[0].length;
    if (overlapsFence(from, to, fences)) continue;
    regions.push({ from, to });
  }

  return regions;
}
