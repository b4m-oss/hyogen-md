import { createHyogenError } from "../errors/createError.js";
import type { ComponentRegistry } from "../component/ComponentRegistry.js";
import type { ExecuteHgBlocksResult, HyogenContext } from "../types.js";
import { parseComponentDirective } from "../parse/parseComponentDirective.js";
import { parseIncludeDirective } from "../parse/parseIncludeDirective.js";
import {
  describeHgBlockMarkerError,
  findUnclosedHgBlock,
  scanHgBlocks,
} from "../parse/scanHgBlocks.js";
import {
  extractHgBlockLines,
  isControlDirectiveLine,
} from "../logic/hgBlockUtils.js";
import { isExecutableBlockSource } from "../logic/parseStatement.js";
import { isDeclarationSource } from "../logic/parseDeclaration.js";

const MARKER_PREFIX = "\u0000HYOGEN_INCLUDE_";

export function createIncludeMarker(index: number): string {
  return `${MARKER_PREFIX}${index}\u0000`;
}

export type ExecuteHgBlocksOptions = {
  path?: string;
  registry?: ComponentRegistry;
  context?: HyogenContext;
};

function parseHgBlockDirective(
  inner: string,
  path?: string,
):
  | ReturnType<typeof parseIncludeDirective>
  | ReturnType<typeof parseComponentDirective>
  | { kind: "control" }
  | null {
  const lines = extractHgBlockLines(inner);

  if (lines.length === 1 && isControlDirectiveLine(lines[0]!)) {
    return { kind: "control" };
  }

  if (
    lines.length === 1 &&
    (isDeclarationSource(lines[0]!) || isExecutableBlockSource(lines[0]!))
  ) {
    return null;
  }

  if (lines.length !== 1) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "hyogen block must contain a single directive" },
    });
  }

  const line = lines[0]!;
  if (/^include\s+/i.test(line) && /\bcomponent\s+/i.test(line)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "include and component cannot coexist in one block" },
    });
  }

  if (/^include\s+/i.test(line)) {
    return parseIncludeDirective(inner, path);
  }

  if (/^component\s+/i.test(line)) {
    return parseComponentDirective(inner, path);
  }

  // v0.4: `block` / `endblock` / single-line `extend` are handled in a
  // separate pipeline step. `executeHgBlocks` only passes them through.
  if (line === "endblock" || /^block\s+/.test(line) || /^extend\s+/.test(line)) {
    return null;
  }

  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message: `unsupported hyogen directive: ${line}` },
  });
}

export function executeHgBlocks(
  source: string,
  options: ExecuteHgBlocksOptions = {},
): ExecuteHgBlocksResult {
  const path = options.path;

  if (findUnclosedHgBlock(source)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: {
        message:
          describeHgBlockMarkerError(source) ??
          "unclosed hyogen block (missing closing marker)",
      },
    });
  }

  const blocks = scanHgBlocks(source);
  if (blocks.length === 0) {
    return { source, directives: [] };
  }

  const directives: ExecuteHgBlocksResult["directives"] = [];
  let result = source;
  let offset = 0;
  let includeIndex = 0;

  for (const block of blocks) {
    const directive = parseHgBlockDirective(block.inner, path);
    if (!directive) {
      continue;
    }

    if (directive.kind === "control") {
      continue;
    }

    const start = block.start - offset;
    const end = block.end - offset;

    if (directive.kind === "component") {
      if (options.registry) {
        options.registry.register(
          {
            alias: directive.alias,
            componentPath: directive.path,
            definedAt: path,
          },
          Object.keys(options.context ?? {}),
          path,
        );
      }
      result = result.slice(0, start) + result.slice(end);
      offset += block.raw.length;
      continue;
    }

    const marker = createIncludeMarker(includeIndex++);
    directives.push({ ...directive, marker, raw: block.raw });
    result = result.slice(0, start) + marker + result.slice(end);
    offset += block.raw.length - marker.length;
  }

  return { source: result, directives };
}
