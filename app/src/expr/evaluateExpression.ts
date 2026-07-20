import { renderComponent } from "../component/renderComponent.js";
import { assertSafeMemberAccess } from "../security/forbiddenKeys.js";
import type { ExprNode, EvaluateExpressionOptions, HyogenContext } from "../types.js";
import { createHyogenError } from "../errors/createError.js";

function isFalsy(value: unknown): boolean {
  return !value;
}

function getPropertyValue(object: unknown, property: string): unknown {
  if (object === null || object === undefined) {
    return undefined;
  }
  if (typeof object !== "object") {
    return undefined;
  }
  return (object as Record<string, unknown>)[property];
}

export async function evaluateExpression(
  node: ExprNode,
  options: EvaluateExpressionOptions,
): Promise<unknown> {
  const { context, path } = options;

  switch (node.type) {
    case "literal":
      return node.value;
    case "identifier":
      assertSafeMemberAccess(node.name, path);
      return context[node.name];
    case "member": {
      assertSafeMemberAccess(node.property, path);
      const objectValue = await evaluateExpression(node.object, options);
      return getPropertyValue(objectValue, node.property);
    }
    case "default": {
      const left = await evaluateExpression(node.left, options);
      if (isFalsy(left)) {
        return evaluateExpression(node.right, options);
      }
      return left;
    }
    case "call": {
      if (!options.registry || !options.loader || !options.visitStack) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `function calls are not allowed: ${node.callee}()`,
          },
        });
      }
      if (!options.registry.has(node.callee)) {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: {
            message: `unregistered component: ${node.callee}`,
          },
        });
      }
      return renderComponent({
        alias: node.callee,
        props: node.args,
        parentContext: options.parentContext ?? context,
        registry: options.registry,
        loader: options.loader,
        rootDir: options.rootDir,
        path,
        warnings: options.warnings ?? [],
        visitStack: options.visitStack,
        preserveHgComments: options.preserveHgComments,
        constrainToRoot: options.constrainToRoot,
      });
    }
    case "method": {
      if (node.method !== "toLocaleString") {
        throw createHyogenError({
          code: "parse_error",
          path,
          details: { message: `unsupported method: ${node.method}()` },
        });
      }
      const objectValue = await evaluateExpression(node.object, options);
      if (
        objectValue === null ||
        objectValue === undefined ||
        typeof (objectValue as { toLocaleString?: unknown }).toLocaleString !==
          "function"
      ) {
        return undefined;
      }
      return (objectValue as { toLocaleString: (...args: unknown[]) => string }).toLocaleString(
        ...(node.args as [string?]),
      );
    }
    default:
      return undefined;
  }
}

/** @deprecated Use evaluateExpression with options object. */
export async function evaluateExpressionAsync(
  node: ExprNode,
  context: HyogenContext,
  options: Omit<EvaluateExpressionOptions, "context"> = {},
): Promise<unknown> {
  return evaluateExpression(node, { ...options, context });
}
