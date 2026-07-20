import { createHyogenError } from "../errors/createError.js";
import { parseExpression } from "../expr/parseExpression.js";
import type {
  CompoundAssignOp,
  Declaration,
  Statement,
} from "../types.js";
import { isReservedWord } from "./reservedWords.js";
import { stripComments } from "./stripComments.js";

function parseError(path: string | undefined, message: string): never {
  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message },
  });
}

export function parseStatementList(
  source: string,
  path?: string,
): Statement[] {
  const withoutComments = stripComments(source).trim();
  if (withoutComments.length === 0) {
    throw parseError(path, "empty statement block");
  }

  const parser = new StatementParser(withoutComments, path);
  const statements = parser.parseStatementList();
  parser.skipWhitespace();
  if (parser.hasMore()) {
    throw parseError(
      path,
      `unexpected token at position ${parser.position}`,
    );
  }
  if (statements.length === 0) {
    throw parseError(path, "empty statement block");
  }
  return statements;
}

export function isExecutableBlockSource(source: string): boolean {
  const trimmed = stripComments(source).trim();
  if (trimmed.length === 0) {
    return false;
  }

  return (
    /^const\s+/.test(trimmed) ||
    /^let\s+/.test(trimmed) ||
    /^for\s*\(/.test(trimmed) ||
    /^do\b/.test(trimmed) ||
    /^(\+\+|--)/.test(trimmed) ||
    /^[A-Za-z_$][A-Za-z0-9_$]*\s*(\+\+|--|[+\-*/]=|=)/.test(trimmed)
  );
}

class StatementParser {
  private index = 0;

  constructor(
    private readonly input: string,
    private readonly path?: string,
  ) {}

  get position(): number {
    return this.index;
  }

  hasMore(): boolean {
    this.skipWhitespace();
    return this.index < this.input.length;
  }

  skipWhitespace(): void {
    while (this.index < this.input.length && /\s/.test(this.input[this.index]!)) {
      this.index++;
    }
  }

  parseStatementList(): Statement[] {
    const statements: Statement[] = [];
    while (this.hasMore()) {
      if (this.peek() === "}") {
        break;
      }
      statements.push(this.parseStatement());
      this.skipOptionalSemicolon();
    }
    return statements;
  }

  parseStatement(): Statement {
    this.skipWhitespace();

    if (this.matchWord("for")) {
      return this.parseFor();
    }
    if (this.matchWord("do")) {
      return this.parseDoWhile();
    }
    if (this.matchWord("while")) {
      throw parseError(
        this.path,
        "bare while loops are not allowed (use do…while)",
      );
    }

    return this.parseSimpleStatement();
  }

  parseSimpleStatement(): Statement {
    this.skipWhitespace();

    const prefixUpdate = this.readPrefixUpdate();
    if (prefixUpdate) {
      return prefixUpdate;
    }

    if (this.matchWord("const")) {
      return this.parseBindingDeclaration("const");
    }
    if (this.matchWord("let")) {
      return this.parseBindingDeclaration("let");
    }

    const name = this.readIdentifier();
    if (!name) {
      throw parseError(this.path, "expected statement");
    }
    this.assertAssignableName(name);
    this.skipWhitespace();

    if (this.match("++") || this.match("--")) {
      const op = this.input.slice(this.index - 2, this.index) as "++" | "--";
      return { kind: "update", name, op, position: "postfix" };
    }

    const compound = this.readCompoundOp();
    if (compound) {
      const exprSource = this.readExpressionSourceUntilTerminator();
      return {
        kind: "compound_assign",
        name,
        op: compound,
        expr: parseExpression(exprSource, this.path),
      };
    }

    if (this.match("=")) {
      if (this.peek() === "=") {
        throw parseError(this.path, "unexpected '==' in assignment");
      }
      const exprSource = this.readExpressionSourceUntilTerminator();
      return {
        kind: "assign",
        name,
        expr: parseExpression(exprSource, this.path),
      };
    }

    throw parseError(this.path, `invalid statement starting with: ${name}`);
  }

  private readPrefixUpdate(): Statement | null {
    this.skipWhitespace();
    if (this.match("++") || this.match("--")) {
      const op = this.input.slice(this.index - 2, this.index) as "++" | "--";
      const name = this.readIdentifier();
      if (!name) {
        throw parseError(this.path, `expected identifier after ${op}`);
      }
      this.assertAssignableName(name);
      return { kind: "update", name, op, position: "prefix" };
    }
    return null;
  }

  private parseBindingDeclaration(kind: "const" | "let"): Declaration {
    const name = this.readIdentifier();
    if (!name) {
      throw parseError(this.path, `expected identifier after ${kind}`);
    }
    this.assertAssignableName(name);
    this.skipWhitespace();
    if (!this.match("=")) {
      throw parseError(this.path, `expected '=' in ${kind} declaration`);
    }
    const exprSource = this.readExpressionSourceUntilTerminator();
    return {
      kind,
      name,
      expr: parseExpression(exprSource, this.path),
    };
  }

  private parseFor(): Statement {
    this.skipWhitespace();
    if (!this.match("(")) {
      throw parseError(this.path, "expected '(' after for");
    }

    const header = this.readBalanced(")");
    const parts = splitForHeader(header);
    if (parts.length !== 3) {
      throw parseError(
        this.path,
        "for…of / for…in are not allowed; use for (init; cond; update)",
      );
    }

    const [initSrc, condSrc, updateSrc] = parts;
    if (condSrc.trim().length === 0) {
      throw parseError(this.path, "for loop condition cannot be empty");
    }

    if (/^\s*[A-Za-z_$][A-Za-z0-9_$]*\s+(of|in)\s+/.test(initSrc)) {
      throw parseError(
        this.path,
        "for…of / for…in are not allowed; use for (init; cond; update)",
      );
    }

    const init =
      initSrc.trim().length === 0
        ? null
        : this.parseClauseStatement(initSrc.trim());
    const cond = parseExpression(condSrc.trim(), this.path);
    const update =
      updateSrc.trim().length === 0
        ? null
        : this.parseClauseStatement(updateSrc.trim());

    this.skipWhitespace();
    if (!this.match("{")) {
      throw parseError(this.path, "expected '{' after for (...)");
    }
    const body = this.parseStatementList();
    this.skipWhitespace();
    if (!this.match("}")) {
      throw parseError(this.path, "expected '}' to close for body");
    }

    return { kind: "for", init, cond, update, body };
  }

  private parseDoWhile(): Statement {
    this.skipWhitespace();
    if (!this.match("{")) {
      throw parseError(this.path, "expected '{' after do");
    }
    const body = this.parseStatementList();
    this.skipWhitespace();
    if (!this.match("}")) {
      throw parseError(this.path, "expected '}' to close do body");
    }
    this.skipWhitespace();
    if (!this.matchWord("while")) {
      throw parseError(this.path, "expected 'while' after do body");
    }
    this.skipWhitespace();
    if (!this.match("(")) {
      throw parseError(this.path, "expected '(' after while");
    }
    const condSrc = this.readBalanced(")");
    if (condSrc.trim().length === 0) {
      throw parseError(this.path, "do…while condition cannot be empty");
    }
    const cond = parseExpression(condSrc.trim(), this.path);
    return { kind: "do_while", body, cond };
  }

  private parseClauseStatement(source: string): Statement {
    const parser = new StatementParser(source, this.path);
    const statement = parser.parseSimpleStatement();
    parser.skipWhitespace();
    if (parser.hasMore()) {
      throw parseError(
        this.path,
        `unexpected token in for clause at position ${parser.position}`,
      );
    }
    return statement;
  }

  private assertAssignableName(name: string): void {
    if (isReservedWord(name)) {
      throw parseError(
        this.path,
        `reserved word cannot be used as identifier: ${name}`,
      );
    }
  }

  private readExpressionSourceUntilTerminator(): string {
    this.skipWhitespace();
    const start = this.index;
    let depthParen = 0;
    let depthBrace = 0;
    let depthBracket = 0;
    let inString: '"' | "'" | "`" | null = null;

    while (this.index < this.input.length) {
      const ch = this.input[this.index]!;

      if (inString) {
        if (ch === "\\") {
          this.index += 2;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
        this.index++;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
        this.index++;
        continue;
      }

      if (ch === "(") depthParen++;
      if (ch === ")") depthParen = Math.max(0, depthParen - 1);
      if (ch === "{") depthBrace++;
      if (ch === "}") {
        if (depthBrace === 0 && depthParen === 0 && depthBracket === 0) {
          break;
        }
        depthBrace = Math.max(0, depthBrace - 1);
      }
      if (ch === "[") depthBracket++;
      if (ch === "]") depthBracket = Math.max(0, depthBracket - 1);

      if (
        (ch === ";" || ch === "\n") &&
        depthParen === 0 &&
        depthBrace === 0 &&
        depthBracket === 0
      ) {
        break;
      }

      this.index++;
    }

    const source = this.input.slice(start, this.index).trim();
    if (source.length === 0) {
      throw parseError(this.path, "expected expression");
    }
    return source;
  }

  private readBalanced(close: ")" | "}"): string {
    const open = close === ")" ? "(" : "{";
    let depth = 1;
    const start = this.index;
    let inString: '"' | "'" | "`" | null = null;

    while (this.index < this.input.length) {
      const ch = this.input[this.index]!;

      if (inString) {
        if (ch === "\\") {
          this.index += 2;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
        this.index++;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
        this.index++;
        continue;
      }

      if (ch === open) {
        depth++;
        this.index++;
        continue;
      }

      if (ch === close) {
        depth--;
        if (depth === 0) {
          const content = this.input.slice(start, this.index);
          this.index++;
          return content;
        }
        this.index++;
        continue;
      }

      this.index++;
    }

    throw parseError(this.path, `expected '${close}'`);
  }

  private readCompoundOp(): CompoundAssignOp | null {
    this.skipWhitespace();
    const ops: CompoundAssignOp[] = ["+=", "-=", "*=", "/="];
    for (const op of ops) {
      if (this.match(op)) {
        return op;
      }
    }
    return null;
  }

  private skipOptionalSemicolon(): void {
    this.skipWhitespace();
    if (this.peek() === ";") {
      this.index++;
    }
  }

  private match(token: string): boolean {
    this.skipWhitespace();
    if (this.input.startsWith(token, this.index)) {
      this.index += token.length;
      return true;
    }
    return false;
  }

  private matchWord(word: string): boolean {
    this.skipWhitespace();
    if (!this.input.startsWith(word, this.index)) {
      return false;
    }
    const after = this.input[this.index + word.length];
    if (after && /[A-Za-z0-9_$]/.test(after)) {
      return false;
    }
    this.index += word.length;
    return true;
  }

  private peek(): string {
    return this.input[this.index] ?? "";
  }

  private readIdentifier(): string {
    this.skipWhitespace();
    const start = this.index;
    const ch = this.peek();
    if (!/[A-Za-z_$]/.test(ch)) {
      return "";
    }
    this.index++;
    while (
      this.index < this.input.length &&
      /[A-Za-z0-9_$]/.test(this.input[this.index]!)
    ) {
      this.index++;
    }
    return this.input.slice(start, this.index);
  }
}

function splitForHeader(header: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;

  for (let i = 0; i < header.length; i++) {
    const ch = header[i]!;

    if (inString) {
      current += ch;
      if (ch === "\\" && i + 1 < header.length) {
        current += header[++i]!;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }

    if (ch === ";" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  parts.push(current);
  return parts;
}
