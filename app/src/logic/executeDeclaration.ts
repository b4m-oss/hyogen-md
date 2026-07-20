import { createHyogenError } from "../errors/createError.js";
import { evaluateExpression } from "../expr/evaluateExpression.js";
import type { Declaration, HyogenContext } from "../types.js";

export type ExecuteDeclarationOptions = {
  path?: string;
  constBindings?: Set<string>;
};

export async function executeDeclaration(
  declaration: Declaration,
  context: HyogenContext,
  options: ExecuteDeclarationOptions = {},
): Promise<void> {
  const { path, constBindings = new Set() } = options;
  const value = await evaluateExpression(declaration.expr, { context, path });

  switch (declaration.kind) {
    case "const": {
      if (constBindings.has(declaration.name)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `cannot reassign const binding: ${declaration.name}`,
          },
        });
      }
      context[declaration.name] = value;
      constBindings.add(declaration.name);
      break;
    }
    case "let": {
      context[declaration.name] = value;
      break;
    }
    case "assign": {
      if (constBindings.has(declaration.name)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `cannot reassign const binding: ${declaration.name}`,
          },
        });
      }
      if (!(declaration.name in context)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `assignment to undeclared variable: ${declaration.name}`,
          },
        });
      }
      context[declaration.name] = value;
      break;
    }
  }
}
