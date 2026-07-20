import { createHyogenError } from "../errors/createError.js";
import type { BinaryOp, ExprNode } from "../types.js";

function isIdentifierStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentifierPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

export function parseExpression(
  source: string,
  path?: string,
  options: { allowCalls?: boolean } = {},
): ExprNode {
  const input = source.trim();
  if (input.length === 0) {
    throw parseError(path, "empty expression");
  }

  const parser = new ExpressionParser(input, path, options);
  const node = parser.parseExpression();
  parser.skipWhitespace();
  if (parser.hasMore()) {
    throw parseError(path, `unexpected token at position ${parser.position}`);
  }
  return node;
}

function parseError(path: string | undefined, message: string): never {
  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message },
  });
}

class ExpressionParser {
  private index = 0;
  private readonly allowCalls: boolean;

  constructor(
    private readonly input: string,
    private readonly path?: string,
    options: { allowCalls?: boolean } = {},
  ) {
    this.allowCalls = options.allowCalls !== false;
  }

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

  parseExpression(): ExprNode {
    return this.parsePipe();
  }

  private parsePipe(): ExprNode {
    let node = this.parseTernary();
    while (true) {
      this.skipWhitespace();
      if (this.peek() !== "|") {
        break;
      }
      // Don't treat || as pipe
      if (this.input[this.index + 1] === "|") {
        break;
      }
      this.index++;
      const right = this.parseTernary();
      node = { type: "default", left: node, right };
    }
    return node;
  }

  private parseTernary(): ExprNode {
    const condition = this.parseLogicalOr();
    this.skipWhitespace();
    if (this.peek() !== "?") {
      return condition;
    }
    this.index++;
    const consequent = this.parseTernary();
    this.skipWhitespace();
    if (this.peek() !== ":") {
      throw parseError(this.path, "expected ':' in ternary expression");
    }
    this.index++;
    const alternate = this.parseTernary();
    return { type: "ternary", condition, consequent, alternate };
  }

  private parseLogicalOr(): ExprNode {
    let node = this.parseLogicalAnd();
    while (true) {
      this.skipWhitespace();
      if (!this.match("||")) {
        break;
      }
      const right = this.parseLogicalAnd();
      node = { type: "binary", op: "||", left: node, right };
    }
    return node;
  }

  private parseLogicalAnd(): ExprNode {
    let node = this.parseComparison();
    while (true) {
      this.skipWhitespace();
      if (!this.match("&&")) {
        break;
      }
      const right = this.parseComparison();
      node = { type: "binary", op: "&&", left: node, right };
    }
    return node;
  }

  private parseComparison(): ExprNode {
    let node = this.parseAdditive();
    while (true) {
      this.skipWhitespace();
      const op = this.readComparisonOp();
      if (!op) {
        break;
      }
      const right = this.parseAdditive();
      node = { type: "binary", op, left: node, right };
    }
    return node;
  }

  private readComparisonOp(): BinaryOp | null {
    const ops: BinaryOp[] = [
      "===",
      "!==",
      "==",
      "!=",
      ">=",
      "<=",
      ">",
      "<",
    ];
    for (const op of ops) {
      if (this.input.startsWith(op, this.index)) {
        this.index += op.length;
        return op;
      }
    }
    return null;
  }

  private parseAdditive(): ExprNode {
    let node = this.parseMultiplicative();
    while (true) {
      this.skipWhitespace();
      const ch = this.peek();
      if (ch !== "+" && ch !== "-") {
        break;
      }
      this.index++;
      const right = this.parseMultiplicative();
      node = { type: "binary", op: ch as "+" | "-", left: node, right };
    }
    return node;
  }

  private parseMultiplicative(): ExprNode {
    let node = this.parseUnary();
    while (true) {
      this.skipWhitespace();
      const ch = this.peek();
      if (ch !== "*" && ch !== "/") {
        break;
      }
      this.index++;
      const right = this.parseUnary();
      node = { type: "binary", op: ch as "*" | "/", left: node, right };
    }
    return node;
  }

  private parseUnary(): ExprNode {
    this.skipWhitespace();
    if (this.peek() === "!") {
      this.index++;
      const operand = this.parseUnary();
      return { type: "unary", op: "!", operand };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ExprNode {
    let node = this.parsePrimary();
    while (true) {
      this.skipWhitespace();
      if (this.peek() === ".") {
        this.index++;
        node = this.parseAfterDot(node);
        continue;
      }
      break;
    }
    return node;
  }

  private parseAfterDot(object: ExprNode): ExprNode {
    this.skipWhitespace();
    const property = this.readIdentifier();
    if (!property) {
      throw parseError(this.path, "expected property name after '.'");
    }

    this.skipWhitespace();
    if (this.peek() === "(") {
      if (property !== "toLocaleString") {
        throw parseError(this.path, `unsupported method: ${property}()`);
      }
      this.index++;
      const args = this.parseMethodArgs();
      return { type: "method", object, method: property, args };
    }

    return { type: "member", object, property };
  }

  private parseMethodArgs(): unknown[] {
    this.skipWhitespace();
    const args: unknown[] = [];

    if (this.peek() === ")") {
      this.index++;
      return args;
    }

    args.push(this.parseLiteralValue());
    this.skipWhitespace();
    while (this.peek() === ",") {
      this.index++;
      args.push(this.parseLiteralValue());
      this.skipWhitespace();
    }

    if (this.peek() !== ")") {
      throw parseError(this.path, "expected ')' after method arguments");
    }
    this.index++;
    return args;
  }

  private parsePrimary(): ExprNode {
    this.skipWhitespace();
    const ch = this.peek();

    if (ch === "(") {
      this.index++;
      const node = this.parseExpression();
      this.skipWhitespace();
      if (this.peek() !== ")") {
        throw parseError(this.path, "expected ')'");
      }
      this.index++;
      return node;
    }

    if (ch === "`") {
      return this.parseTemplateLiteral();
    }

    if (ch === '"' || ch === "'") {
      return { type: "literal", value: this.readString() };
    }

    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      return { type: "literal", value: this.readNumber() };
    }

    if (ch === "{") {
      return { type: "literal", value: this.parseObjectLiteral() };
    }

    if (ch === "[") {
      return { type: "literal", value: this.parseArrayLiteral() };
    }

    if (isIdentifierStart(ch)) {
      const name = this.readIdentifier();
      if (
        name === "true" ||
        name === "false" ||
        name === "null" ||
        name === "undefined"
      ) {
        const value =
          name === "true"
            ? true
            : name === "false"
              ? false
              : name === "null"
                ? null
                : undefined;
        return { type: "literal", value };
      }

      this.skipWhitespace();
      if (this.peek() === "(") {
        if (!this.allowCalls) {
          throw parseError(
            this.path,
            "component calls are not allowed in template literals",
          );
        }
        this.index++;
        const args = this.parseCallArgs();
        return { type: "call", callee: name, args };
      }

      if (this.peek() === "[") {
        throw parseError(this.path, "bracket access is not allowed");
      }

      return { type: "identifier", name };
    }

    throw parseError(this.path, `unexpected character '${ch}'`);
  }

  private parseTemplateLiteral(): ExprNode {
    // Consume opening backtick.
    this.index++;
    const parts: Array<string | ExprNode> = [];
    let current = "";

    while (this.index < this.input.length) {
      const ch = this.input[this.index]!;

      if (ch === "`") {
        this.index++;
        parts.push(current);
        return { type: "template", parts };
      }

      if (ch === "\\") {
        this.index++;
        if (this.index >= this.input.length) {
          throw parseError(this.path, "unterminated template literal escape");
        }
        current += this.input[this.index]!;
        this.index++;
        continue;
      }

      if (ch === "$" && this.input[this.index + 1] === "{") {
        parts.push(current);
        current = "";
        this.index += 2;
        const exprSource = this.readTemplateExpression();
        const expr = parseExpression(exprSource, this.path, {
          allowCalls: false,
        });
        parts.push(expr);
        continue;
      }

      current += ch;
      this.index++;
    }

    throw parseError(this.path, "unterminated template literal");
  }

  private readTemplateExpression(): string {
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

      if (ch === "{") {
        depth++;
        this.index++;
        continue;
      }

      if (ch === "}") {
        depth--;
        if (depth === 0) {
          const source = this.input.slice(start, this.index);
          this.index++;
          return source;
        }
        this.index++;
        continue;
      }

      this.index++;
    }

    throw parseError(this.path, "unterminated template expression");
  }

  private parseCallArgs(): Record<string, unknown> {
    this.skipWhitespace();
    if (this.peek() === ")") {
      this.index++;
      return {};
    }

    const args = this.parseObjectLiteral();
    this.skipWhitespace();
    if (this.peek() !== ")") {
      throw parseError(this.path, "expected ')' after call arguments");
    }
    this.index++;
    return args;
  }

  private parseObjectLiteral(): Record<string, unknown> {
    if (this.peek() !== "{") {
      throw parseError(this.path, "expected object literal");
    }
    this.index++;
    this.skipWhitespace();

    const result: Record<string, unknown> = {};
    if (this.peek() === "}") {
      this.index++;
      return result;
    }

    while (true) {
      this.skipWhitespace();
      const key = this.readIdentifier();
      if (!key) {
        throw parseError(this.path, "expected property name in object literal");
      }

      this.skipWhitespace();
      if (this.peek() !== ":") {
        throw parseError(this.path, "expected ':' in object literal");
      }
      this.index++;
      this.skipWhitespace();

      result[key] = this.parseLiteralValue();
      this.skipWhitespace();

      if (this.peek() === "}") {
        this.index++;
        break;
      }
      if (this.peek() === ",") {
        this.index++;
        this.skipWhitespace();
        if (this.peek() === "}") {
          this.index++;
          break;
        }
      } else {
        throw parseError(this.path, "expected ',' or '}' in object literal");
      }
    }

    return result;
  }

  private parseArrayLiteral(): unknown[] {
    if (this.peek() !== "[") {
      throw parseError(this.path, "expected array literal");
    }
    this.index++;
    this.skipWhitespace();

    const result: unknown[] = [];
    if (this.peek() === "]") {
      this.index++;
      return result;
    }

    while (true) {
      this.skipWhitespace();
      result.push(this.parseLiteralValue());
      this.skipWhitespace();

      if (this.peek() === "]") {
        this.index++;
        break;
      }
      if (this.peek() === ",") {
        this.index++;
        this.skipWhitespace();
        if (this.peek() === "]") {
          this.index++;
          break;
        }
      } else {
        throw parseError(this.path, "expected ',' or ']' in array literal");
      }
    }

    return result;
  }

  private parseLiteralValue(): unknown {
    this.skipWhitespace();
    const ch = this.peek();

    if (ch === '"' || ch === "'") {
      return this.readString();
    }
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      return this.readNumber();
    }
    if (ch === "{") {
      return this.parseObjectLiteral();
    }
    if (ch === "[") {
      return this.parseArrayLiteral();
    }
    if (isIdentifierStart(ch)) {
      const name = this.readIdentifier();
      if (name === "true") return true;
      if (name === "false") return false;
      if (name === "null") return null;
      throw parseError(this.path, "object literal values must be literals");
    }

    throw parseError(this.path, "object literal values must be literals");
  }

  private match(token: string): boolean {
    this.skipWhitespace();
    if (this.input.startsWith(token, this.index)) {
      this.index += token.length;
      return true;
    }
    return false;
  }

  private peek(): string {
    return this.input[this.index] ?? "";
  }

  private readIdentifier(): string {
    this.skipWhitespace();
    const start = this.index;
    if (!isIdentifierStart(this.peek())) {
      return "";
    }
    this.index++;
    while (this.index < this.input.length && isIdentifierPart(this.peek())) {
      this.index++;
    }
    return this.input.slice(start, this.index);
  }

  private readString(): string {
    const quote = this.peek();
    this.index++;
    let value = "";
    while (this.index < this.input.length) {
      const ch = this.input[this.index]!;
      if (ch === quote) {
        this.index++;
        return value;
      }
      if (ch === "\\") {
        this.index++;
        if (this.index >= this.input.length) {
          throw parseError(this.path, "unterminated string escape");
        }
        const escaped = this.input[this.index]!;
        value += escaped;
        this.index++;
        continue;
      }
      value += ch;
      this.index++;
    }
    throw parseError(this.path, "unterminated string literal");
  }

  private readNumber(): number {
    const start = this.index;
    if (this.peek() === "-") {
      this.index++;
    }
    while (this.index < this.input.length && /[0-9.]/.test(this.peek())) {
      this.index++;
    }
    const raw = this.input.slice(start, this.index);
    const value = Number(raw);
    if (Number.isNaN(value)) {
      throw parseError(this.path, `invalid number '${raw}'`);
    }
    return value;
  }
}
