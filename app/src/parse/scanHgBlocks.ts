import type { HgBlock } from "../types.js";
import { classifyHgMarkers } from "./hgMarkers.js";

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
    const kind = classifyHgMarkers(inner);

    if (kind === "hg" || kind === "at-at") {
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

/**
 * Detects unclosed or mixed hyogen markers inside HTML comments (execute stage).
 * Mixed `@hg`/`@@` markers are treated as invalid (same as unclosed for callers).
 */
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
    const kind = classifyHgMarkers(inner);
    if (kind === "unclosed" || kind === "mixed") {
      return true;
    }

    searchFrom = commentEnd + 3;
  }

  return false;
}

/** Returns a parse_error message when markers are mixed or unclosed. */
export function describeHgBlockMarkerError(source: string): string | null {
  let searchFrom = 0;

  while (searchFrom < source.length) {
    const commentStart = source.indexOf("<!--", searchFrom);
    if (commentStart === -1) {
      return null;
    }

    if (isInsideCodeFence(source, commentStart)) {
      searchFrom = commentStart + 4;
      continue;
    }

    const commentEnd = source.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      return null;
    }

    const inner = source.slice(commentStart + 4, commentEnd);
    const kind = classifyHgMarkers(inner);
    if (kind === "mixed") {
      return "mixed @hg and @@ markers are not allowed";
    }
    if (kind === "unclosed") {
      return "unclosed hyogen block (missing closing marker)";
    }

    searchFrom = commentEnd + 3;
  }

  return null;
}
