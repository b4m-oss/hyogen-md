import type { ExprNode, HyogenContext } from "../types.js";

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

export function evaluateExpression(
  node: ExprNode,
  context: HyogenContext,
): unknown {
  switch (node.type) {
    case "literal":
      return node.value;
    case "identifier":
      return context[node.name];
    case "member": {
      const objectValue = evaluateExpression(node.object, context);
      return getPropertyValue(objectValue, node.property);
    }
    case "default": {
      const left = evaluateExpression(node.left, context);
      if (isFalsy(left)) {
        return evaluateExpression(node.right, context);
      }
      return left;
    }
    default:
      return undefined;
  }
}
