import { scanHgBlocks } from "../parse/scanHgBlocks.js";

/** Removes complete hyogen HTML comment blocks from source. */
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
    result = result.slice(0, start) + result.slice(end);
    offset += block.raw.length;
  }

  return result;
}
