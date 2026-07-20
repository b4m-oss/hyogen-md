import { createHyogenError } from "../errors/createError.js";
import { parseExpression } from "../expr/parseExpression.js";
import type { Declaration, ExprNode } from "../types.js";
import { isReservedWord } from "./reservedWords.js";
import { stripComments } from "./stripComments.js";

function parseError(path: string | undefined, message: string): never {
  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message },
  });
}

export function parseDeclaration(
  source: string,
  path?: string,
): Declaration {
  const trimmed = stripComments(source).trim();
  if (trimmed.length === 0) {
    throw parseError(path, "empty declaration");
  }

  const constPrefix = /^const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/.exec(trimmed);
  if (constPrefix) {
    const name = constPrefix[1]!;
    if (isReservedWord(name)) {
      throw parseError(path, `reserved word cannot be used as identifier: ${name}`);
    }
    const exprSource = trimmed.slice(constPrefix[0].length).replace(/;\s*$/, "").trim();
    return {
      kind: "const",
      name,
      expr: parseExpression(exprSource, path),
    };
  }

  const letPrefix = /^let\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/.exec(trimmed);
  if (letPrefix) {
    const name = letPrefix[1]!;
    if (isReservedWord(name)) {
      throw parseError(path, `reserved word cannot be used as identifier: ${name}`);
    }
    const exprSource = trimmed.slice(letPrefix[0].length).replace(/;\s*$/, "").trim();
    return {
      kind: "let",
      name,
      expr: parseExpression(exprSource, path),
    };
  }

  const assignPrefix = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*=/.exec(trimmed);
  if (assignPrefix) {
    const name = assignPrefix[1]!;
    if (isReservedWord(name)) {
      throw parseError(path, `reserved word cannot be used as identifier: ${name}`);
    }
    const exprSource = trimmed.slice(assignPrefix[0].length).replace(/;\s*$/, "").trim();
    return {
      kind: "assign",
      name,
      expr: parseExpression(exprSource, path),
    };
  }

  throw parseError(path, `invalid declaration: ${trimmed}`);
}

export function parseDeclarationStatements(
  source: string,
  path?: string,
): Declaration[] {
  const withoutComments = stripComments(source);
  const statements = splitStatements(withoutComments);

  if (statements.length === 0) {
    throw parseError(path, "empty declaration block");
  }

  return statements.map((statement) => parseDeclaration(statement, path));
}

function splitStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringQuote = "";

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;

    if (inString) {
      current += ch;
      if (ch === stringQuote && source[i - 1] !== "\\") {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      current += ch;
      continue;
    }

    if (ch === "{" || ch === "[" || ch === "(") {
      depth++;
      current += ch;
      continue;
    }

    if (ch === "}" || ch === "]" || ch === ")") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }

    if ((ch === ";" || ch === "\n") && depth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = "";
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

export function isDeclarationSource(source: string): boolean {
  const trimmed = stripComments(source).trim();
  if (trimmed.length === 0) {
    return false;
  }

  return (
    /^const\s+/.test(trimmed) ||
    /^let\s+/.test(trimmed) ||
    /^[A-Za-z_$][A-Za-z0-9_$]*\s*=/.test(trimmed)
  );
}

export type { ExprNode };
