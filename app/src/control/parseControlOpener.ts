import { createHyogenError } from "../errors/createError.js";
import { parseExpression } from "../expr/parseExpression.js";
import type { ControlOpener } from "../types.js";
import { extractHgBlockLines } from "../logic/hgBlockUtils.js";

function parseError(path: string | undefined, message: string): never {
  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message },
  });
}

export function parseControlOpener(
  source: string,
  path?: string,
): ControlOpener | null {
  let inner = source;
  const commentMatch = /^<!--([\s\S]*?)-->$/.exec(source.trim());
  if (commentMatch) {
    inner = commentMatch[1]!;
  }

  const lines = extractHgBlockLines(inner);
  if (lines.length !== 1) {
    return null;
  }

  const line = lines[0]!;

  if (/^include\s+/i.test(line) || /^component\s+/i.test(line)) {
    return null;
  }

  if (/^const\s+/i.test(line) || /^let\s+/i.test(line)) {
    return null;
  }

  if (/^[A-Za-z_$][A-Za-z0-9_$]*\s*=/.test(line)) {
    return null;
  }

  if (line === "else") {
    return { kind: "else" };
  }

  if (line === "endif") {
    return { kind: "endif" };
  }

  if (line === "endeach") {
    return { kind: "endeach" };
  }

  if (/^IF\b/.test(line) || /^ELSE\b/.test(line) || /^ENDIF\b/.test(line)) {
    throw parseError(path, "control keywords must be lowercase");
  }

  const elseIfMatch = /^else\s+if\s+(.+)$/.exec(line);
  if (elseIfMatch) {
    return {
      kind: "else_if",
      expr: parseExpression(elseIfMatch[1]!, path),
    };
  }

  const ifMatch = /^if\s+(.+)$/.exec(line);
  if (ifMatch) {
    return {
      kind: "if",
      expr: parseExpression(ifMatch[1]!, path),
    };
  }

  const eachMatch = /^each\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+in\s+(.+)$/.exec(line);
  if (eachMatch) {
    return {
      kind: "each",
      item: eachMatch[1]!,
      expr: parseExpression(eachMatch[2]!, path),
    };
  }

  if (line === "if") {
    throw parseError(path, "if requires an expression");
  }

  if (/^each\s+/.test(line)) {
    throw parseError(path, "invalid each directive");
  }

  return null;
}
