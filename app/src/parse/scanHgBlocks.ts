import type { HgBlock } from "../types.js";

function isInsideCodeFence(source: string, index: number): boolean {
  let i = 0;
  let inFence = false;

  while (i < index) {
    const fenceStart = source.indexOf("```", i);
    if (fenceStart === -1 || fenceStart >= index) {
      break;
    }
    inFence = !inFence;
    i = fenceStart + 3;
  }

  return inFence;
}

/** Finds complete hyogen HTML comment blocks in document order. */
export function scanHgBlocks(source: string): HgBlock[] {
  const blocks: HgBlock[] = [];
  let searchFrom = 0;

  while (searchFrom < source.length) {
    const commentStart = source.indexOf("<!--", searchFrom);
    if (commentStart === -1) {
      break;
    }

    if (isInsideCodeFence(source, commentStart)) {
      searchFrom = commentStart + 4;
      continue;
    }

    const commentEnd = source.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      break;
    }

    const raw = source.slice(commentStart, commentEnd + 3);
    const inner = raw.slice(4, raw.length - 3);

    if (inner.includes("@hg") && inner.includes("@endhg")) {
      blocks.push({
        start: commentStart,
        end: commentEnd + 3,
        inner,
        raw,
      });
    }

    searchFrom = commentEnd + 3;
  }

  return blocks;
}

/** Detects @hg without matching @endhg inside an HTML comment (execute stage). */
export function findUnclosedHgBlock(source: string): boolean {
  let searchFrom = 0;

  while (searchFrom < source.length) {
    const commentStart = source.indexOf("<!--", searchFrom);
    if (commentStart === -1) {
      return false;
    }

    if (isInsideCodeFence(source, commentStart)) {
      searchFrom = commentStart + 4;
      continue;
    }

    const commentEnd = source.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      return false;
    }

    const inner = source.slice(commentStart + 4, commentEnd);
    if (inner.includes("@hg") && !inner.includes("@endhg")) {
      return true;
    }

    searchFrom = commentEnd + 3;
  }

  return false;
}
