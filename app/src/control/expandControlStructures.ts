import { createHyogenError } from "../errors/createError.js";
import { evaluateExpression } from "../expr/evaluateExpression.js";
import { interpolateExpressions } from "../expr/interpolateExpressions.js";
import type { ControlNode, EvaluateExpressionOptions, HyogenWarning } from "../types.js";
import { parseControlStructures } from "./parseControlStructures.js";
import { StructureNestTracker } from "./StructureNestTracker.js";

function isTruthy(value: unknown): boolean {
  return Boolean(value);
}

function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    value !== null &&
    value !== undefined &&
    typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
      "function"
  );
}

function createNestLimitWarning(path?: string): HyogenWarning {
  return {
    code: "nest_limit_exceeded",
    message: "structure nest limit exceeded",
    path,
    details: { limit: 20 },
  };
}

export async function expandControlStructures(
  source: string,
  options: EvaluateExpressionOptions,
): Promise<string> {
  const path = options.path;
  const warnings = options.warnings ?? [];
  const nodes = parseControlStructures(source, path);
  const tracker = new StructureNestTracker();
  return expandNodes(nodes, options, tracker, warnings);
}

async function expandNodes(
  nodes: ControlNode[],
  options: EvaluateExpressionOptions,
  tracker: StructureNestTracker,
  warnings: HyogenWarning[],
): Promise<string> {
  let result = "";

  for (const node of nodes) {
    result += await expandNode(node, options, tracker, warnings);
  }

  return result;
}

async function expandNode(
  node: ControlNode,
  options: EvaluateExpressionOptions,
  tracker: StructureNestTracker,
  warnings: HyogenWarning[],
): Promise<string> {
  switch (node.kind) {
    case "text":
      return node.content;
    case "if":
      return expandIf(node, options, tracker, warnings);
    case "each":
      return expandEach(node, options, tracker, warnings);
    default:
      return "";
  }
}

async function expandIf(
  node: Extract<ControlNode, { kind: "if" }>,
  options: EvaluateExpressionOptions,
  tracker: StructureNestTracker,
  warnings: HyogenWarning[],
): Promise<string> {
  const enter = tracker.enter();
  if (enter.exceeded) {
    warnings.push(createNestLimitWarning(options.path));
    return "";
  }

  try {
    let selectedIndex = -1;

    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i]!;
      if (branch.kind === "else") {
        selectedIndex = i;
        break;
      }
      const value = await evaluateExpression(branch.expr!, options);
      if (isTruthy(value)) {
        selectedIndex = i;
        break;
      }
    }

    let result = "";
    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i]!;
      result += branch.opener.raw;
      if (i === selectedIndex) {
        result += await expandNodes(branch.body, options, tracker, warnings);
      }
    }
    result += node.closer.raw;
    return result;
  } finally {
    tracker.exit();
  }
}

async function expandEach(
  node: Extract<ControlNode, { kind: "each" }>,
  options: EvaluateExpressionOptions,
  tracker: StructureNestTracker,
  warnings: HyogenWarning[],
): Promise<string> {
  const enter = tracker.enter();
  if (enter.exceeded) {
    warnings.push(createNestLimitWarning(options.path));
    return "";
  }

  try {
    const iterable = await evaluateExpression(node.expr, options);
    if (!isIterable(iterable)) {
      return "";
    }

    let result = "";
    for (const item of iterable) {
      const scopedContext = { ...options.context, [node.item]: item };
      result += node.opener.raw;
      const bodyText = await expandNodes(node.body, {
        ...options,
        context: scopedContext,
      }, tracker, warnings);

      const interpolated = await interpolateExpressions(bodyText, scopedContext, {
        path: options.path,
        registry: options.registry,
        loader: options.loader,
        rootDir: options.rootDir,
        warnings,
        visitStack: options.visitStack,
        parentContext: options.parentContext ?? options.context,
        preserveHgComments: options.preserveHgComments,
        constrainToRoot: options.constrainToRoot,
      });

      result += interpolated;
      result += node.closer.raw;
    }

    return result;
  } finally {
    tracker.exit();
  }
}

export async function expandControlStructuresOrThrow(
  source: string,
  options: EvaluateExpressionOptions,
): Promise<string> {
  try {
    return await expandControlStructures(source, options);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error;
    }
    throw createHyogenError({
      code: "parse_error",
      path: options.path,
      details: { message: "control structure expansion failed" },
    });
  }
}
