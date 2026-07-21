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

/** Drop the newline that typically follows an opener / closer line. */
function chompLeadingNewline(text: string): string {
  return text.startsWith("\n") ? text.slice(1) : text;
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
  const preserve = options.preserveHgComments === true;
  let result = "";
  let chompNextLeadingNewline = false;

  for (const node of nodes) {
    let piece = await expandNode(node, options, tracker, warnings);
    if (chompNextLeadingNewline) {
      piece = chompLeadingNewline(piece);
    }
    result += piece;
    chompNextLeadingNewline =
      !preserve && (node.kind === "if" || node.kind === "each");
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

    const preserve = options.preserveHgComments === true;
    let result = "";
    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i]!;
      if (preserve) {
        result += branch.opener.raw;
      }
      if (i === selectedIndex) {
        let body = await expandNodes(branch.body, options, tracker, warnings);
        if (!preserve) {
          body = chompLeadingNewline(body);
        }
        result += body;
      }
    }
    if (preserve) {
      result += node.closer.raw;
    }
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

    const preserve = options.preserveHgComments === true;
    let result = "";
    for (const item of iterable) {
      const scopedContext = { ...options.context, [node.item]: item };
      if (preserve) {
        result += node.opener.raw;
      }
      let bodyText = await expandNodes(node.body, {
        ...options,
        context: scopedContext,
      }, tracker, warnings);
      if (!preserve) {
        bodyText = chompLeadingNewline(bodyText);
      }

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
      if (preserve) {
        result += node.closer.raw;
      }
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
