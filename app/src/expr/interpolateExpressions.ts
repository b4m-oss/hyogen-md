import { createHyogenError } from "../errors/createError.js";
import type { InterpolateExpressionsOptions } from "../types.js";
import { evaluateExpression } from "./evaluateExpression.js";
import { parseExpression } from "./parseExpression.js";

export async function interpolateExpressions(
  source: string,
  context: InterpolateExpressionsOptions["context"],
  options: Omit<InterpolateExpressionsOptions, "context"> & {
    path?: string;
  } = {},
): Promise<string> {
  const path = options.path;
  let result = "";
  let i = 0;

  while (i < source.length) {
    const open = source.indexOf("{", i);
    if (open === -1) {
      result += source.slice(i);
      break;
    }

    result += source.slice(i, open);

    const isTriple =
      source[open + 1] === "{" &&
      source[open + 2] === "{" &&
      (open === 0 || source[open - 1] !== "\\");

    const isDouble =
      !isTriple &&
      source[open + 1] === "{" &&
      (open === 0 || source[open - 1] !== "\\");

    if (!isDouble && !isTriple) {
      result += "{";
      i = open + 1;
      continue;
    }

    const openLen = isTriple ? 3 : 2;
    const closeToken = isTriple ? "}}}" : "}}";
    const close = source.indexOf(closeToken, open + openLen);
    if (close === -1) {
      throw createHyogenError({
        code: "parse_error",
        path,
        details: { message: "unclosed expression" },
      });
    }

    const exprSource = source.slice(open + openLen, close).trim();
    const node = parseExpression(exprSource, path);
    const value = await evaluateExpression(node, {
      ...options,
      context,
      path,
      parentContext: options.parentContext ?? context,
    });
    result += value === undefined || value === null ? "" : String(value);
    i = close + closeToken.length;
  }

  return result;
}
