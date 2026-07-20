import { createHyogenError } from "../errors/createError.js";
import { evaluateExpression } from "../expr/evaluateExpression.js";
import type { HyogenContext, Statement } from "../types.js";
import { executeDeclaration } from "./executeDeclaration.js";

export type ExecuteStatementOptions = {
  path?: string;
  constBindings?: Set<string>;
  onUpdate?: (name: string) => void;
};

function isFalsy(value: unknown): boolean {
  return !value;
}

export async function executeStatement(
  statement: Statement,
  context: HyogenContext,
  options: ExecuteStatementOptions = {},
): Promise<void> {
  const { path, constBindings = new Set(), onUpdate } = options;

  switch (statement.kind) {
    case "const":
    case "let":
    case "assign": {
      await executeDeclaration(statement, context, { path, constBindings });
      onUpdate?.(statement.name);
      return;
    }
    case "update": {
      if (constBindings.has(statement.name)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `cannot reassign const binding: ${statement.name}`,
          },
        });
      }
      if (!(statement.name in context)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `assignment to undeclared variable: ${statement.name}`,
          },
        });
      }
      const current = Number(context[statement.name]);
      const next =
        statement.op === "++" ? current + 1 : current - 1;
      context[statement.name] = next;
      onUpdate?.(statement.name);
      return;
    }
    case "compound_assign": {
      if (constBindings.has(statement.name)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `cannot reassign const binding: ${statement.name}`,
          },
        });
      }
      if (!(statement.name in context)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `assignment to undeclared variable: ${statement.name}`,
          },
        });
      }
      const right = await evaluateExpression(statement.expr, { context, path });
      const left = Number(context[statement.name]);
      const rightNum = Number(right);
      let next: number;
      switch (statement.op) {
        case "+=":
          next = left + rightNum;
          break;
        case "-=":
          next = left - rightNum;
          break;
        case "*=":
          next = left * rightNum;
          break;
        case "/=":
          next = left / rightNum;
          break;
      }
      context[statement.name] = next;
      onUpdate?.(statement.name);
      return;
    }
    case "for": {
      if (statement.init) {
        await executeStatement(statement.init, context, options);
      }
      while (true) {
        const cond = await evaluateExpression(statement.cond, {
          context,
          path,
        });
        if (isFalsy(cond)) {
          break;
        }
        for (const bodyStmt of statement.body) {
          await executeStatement(bodyStmt, context, options);
        }
        if (statement.update) {
          await executeStatement(statement.update, context, options);
        }
      }
      return;
    }
    case "do_while": {
      do {
        for (const bodyStmt of statement.body) {
          await executeStatement(bodyStmt, context, options);
        }
        const cond = await evaluateExpression(statement.cond, {
          context,
          path,
        });
        if (isFalsy(cond)) {
          break;
        }
      } while (true);
      return;
    }
  }
}

export async function executeStatementList(
  statements: Statement[],
  context: HyogenContext,
  options: ExecuteStatementOptions = {},
): Promise<void> {
  for (const statement of statements) {
    await executeStatement(statement, context, options);
  }
}
