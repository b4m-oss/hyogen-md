import { createHyogenError } from "../errors/createError.js";
import type { IncludeDirective } from "../types.js";
import { stripHgMarkers } from "./hgMarkers.js";

export function parseIncludeDirective(
  inner: string,
  path?: string,
): Pick<IncludeDirective, "kind" | "path"> {
  const trimmed = stripHgMarkers(inner).trim();
  if (trimmed.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "empty hyogen block" },
    });
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length !== 1) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "hyogen block must contain a single include directive" },
    });
  }

  const line = lines[0]!;
  const includeMatch = /^include\s+(\S+)\s*$/.exec(line);
  if (includeMatch) {
    return { kind: "include", path: includeMatch[1]! };
  }

  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message: `unsupported hyogen directive: ${line}` },
  });
}
