import { createHyogenError } from "../errors/createError.js";
import type { ExprNode } from "../types.js";

function isIdentifierStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentifierPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

export function parseExpression(source: string, path?: string): ExprNode {
  const input = source.trim();
  if (input.length === 0) {
    throw parseError(path, "empty expression");
  }

  const parser = new ExpressionParser(input, path);
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

  parseExpression(): ExprNode {
    this.skipWhitespace();
    let node = this.parsePrimary();

    while (true) {
      this.skipWhitespace();
      if (this.peek() === ".") {
        this.index++;
        node = this.parseAfterDot(node);
        continue;
      }
      if (this.peek() === "|") {
        this.index++;
        const right = this.parsePrimary();
        return { type: "default", left: node, right };
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

    if (ch === '"' || ch === "'") {
      return { type: "literal", value: this.readString() };
    }

    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      return { type: "literal", value: this.readNumber() };
    }

    if (ch === "{") {
      return { type: "literal", value: this.parseObjectLiteral() };
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
        this.index++;
        const args = this.parseCallArgs();
        return { type: "call", callee: name, args };
      }

      if (this.peek() === "[") {
        throw parseError(this.path, "bracket access is not allowed");
      }
      if (this.peek() === "?") {
        throw parseError(this.path, "ternary expressions are not allowed");
      }

      return { type: "identifier", name };
    }

    throw parseError(this.path, `unexpected character '${ch}'`);
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
      if (this.peek() !== ",") {
        throw parseError(this.path, "expected ',' or '}' in object literal");
      }
      this.index++;
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
    if (isIdentifierStart(ch)) {
      const name = this.readIdentifier();
      if (name === "true") return true;
      if (name === "false") return false;
      if (name === "null") return null;
      throw parseError(this.path, "object literal values must be literals");
    }

    throw parseError(this.path, "object literal values must be literals");
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
