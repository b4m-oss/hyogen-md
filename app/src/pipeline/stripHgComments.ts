import { scanHgBlocks } from "../parse/scanHgBlocks.js";
import {
  joinRemovalSeam,
  removalSeamNewlineDelta,
} from "./joinRemovalSeam.js";

/**
 * Removes complete hyogen HTML comment blocks from source.
 * At each removal seam, joins surrounding newline runs with max(left, right)
 * so directive removal does not invent an extra blank line, while author
 * blank lines around the comment are preserved.
 */
export function stripHgComments(
  source: string,
  preserveHgComments = false,
): string {
  if (preserveHgComments) {
    return source;
  }

  const blocks = scanHgBlocks(source);
  if (blocks.length === 0) {
    return source;
  }

  let result = source;
  let offset = 0;

  for (const block of blocks) {
    const start = block.start - offset;
    const end = block.end - offset;
    const left = result.slice(0, start);
    const right = result.slice(end);

    result = joinRemovalSeam(left, right);
    offset += block.raw.length + removalSeamNewlineDelta(left, right);
  }

  return result;
}
