import { createHyogenError } from "../errors/createError.js";
import type { ExecuteHgBlocksResult } from "../types.js";
import { parseIncludeDirective } from "../parse/parseIncludeDirective.js";
import { findUnclosedHgBlock, scanHgBlocks } from "../parse/scanHgBlocks.js";

const MARKER_PREFIX = "\u0000HYOGEN_INCLUDE_";

export function createIncludeMarker(index: number): string {
  return `${MARKER_PREFIX}${index}\u0000`;
}

export function executeHgBlocks(
  source: string,
  path?: string,
): ExecuteHgBlocksResult {
  if (findUnclosedHgBlock(source)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "unclosed @hg block (missing @endhg)" },
    });
  }

  const blocks = scanHgBlocks(source);
  if (blocks.length === 0) {
    return { source, directives: [] };
  }

  const directives: ExecuteHgBlocksResult["directives"] = [];
  let result = source;
  let offset = 0;

  blocks.forEach((block, index) => {
    const marker = createIncludeMarker(index);
    const directive = parseIncludeDirective(block.inner, path);
    directives.push({ ...directive, marker, raw: block.raw });

    const start = block.start - offset;
    const end = block.end - offset;
    result = result.slice(0, start) + marker + result.slice(end);
    offset += block.raw.length - marker.length;
  });

  return { source: result, directives };
}
