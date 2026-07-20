import { createHyogenError } from "../errors/createError.js";
import { extractHgBlockLines } from "../logic/hgBlockUtils.js";
import { parseExtendDirective } from "./parseExtendDirective.js";

export type ExtendBlockParseResult = {
  path: string;
  /** remaining lines after `extend <path>` (declaration source) */
  declarationsSource: string;
};

/**
 * Parses an `@hg` block that begins with `extend <path>` and (optionally)
 * contains declaration lines after it.
 *
 * Returns null when the first non-empty line isn't an `extend`.
 */
export function parseExtendBlock(inner: string, pathForError?: string): ExtendBlockParseResult | null {
  const lines = extractHgBlockLines(inner);
  if (lines.length === 0) return null;

  const extendLine = lines[0]!;
  const extend = parseExtendDirective(extendLine, pathForError);
  if (!extend) return null;

  // `extend` must be the first line in this block.
  for (const line of lines.slice(1)) {
    if (/^extend\s+/i.test(line)) {
      throw createHyogenError({
        code: "parse_error",
        path: pathForError,
        details: { message: "extend must be the first line of extend block" },
      });
    }
  }

  return {
    path: extend.path,
    declarationsSource: lines.slice(1).join("\n"),
  };
}

