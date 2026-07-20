import { createHyogenError } from "../errors/createError.js";
import { isReservedWord } from "../logic/reservedWords.js";

export type BlockOpener =
  | { kind: "block"; name: string }
  | { kind: "endblock" };

const BLOCK_PATTERN = /^block\s+([A-Za-z_$][A-Za-z0-9_$]*)$/;

/** Parses a single line `block <name>` / `endblock`. */
export function parseBlockOpener(line: string, pathForError?: string): BlockOpener {
  const trimmed = line.trim();

  if (trimmed === "endblock") {
    return { kind: "endblock" };
  }

  const match = BLOCK_PATTERN.exec(trimmed);
  if (!match) {
    throw createHyogenError({
      code: "parse_error",
      path: pathForError,
      details: { message: "invalid block directive" },
    });
  }

  const name = match[1]!;
  if (isReservedWord(name)) {
    throw createHyogenError({
      code: "parse_error",
      path: pathForError,
      details: { message: `reserved word cannot be used as block name: ${name}` },
    });
  }

  return { kind: "block", name };
}

