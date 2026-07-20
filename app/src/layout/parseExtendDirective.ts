import { createHyogenError } from "../errors/createError.js";

export type ExtendDirective = {
  path: string;
};

/** Parses a single line `extend <path>` directive. Returns null when non-extend. */
export function parseExtendDirective(line: string, pathForError?: string): ExtendDirective | null {
  const trimmed = line.trim();

  // Not an extend directive.
  if (!/^extend\b/i.test(trimmed)) return null;
  if (!/^extend\s+/i.test(trimmed)) {
    throw createHyogenError({
      code: "parse_error",
      path: pathForError,
      details: { message: "missing extend path" },
    });
  }

  const match = /^extend\s+(\S+)\s*$/.exec(trimmed);
  if (!match) {
    throw createHyogenError({
      code: "parse_error",
      path: pathForError,
      details: { message: "invalid extend directive" },
    });
  }

  const resolvedPath = match[1]!;
  if (resolvedPath.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: pathForError,
      details: { message: "invalid extend path" },
    });
  }

  return { path: resolvedPath };
}

