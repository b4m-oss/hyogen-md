import { createHyogenError } from "../errors/createError.js";
import type { ControlBlockSpan, ControlNode, IfBranch } from "../types.js";
import { scanHgBlocks } from "../parse/scanHgBlocks.js";
import { parseControlOpener } from "./parseControlOpener.js";

type ControlEntry = {
  start: number;
  end: number;
  raw: string;
  opener: NonNullable<ReturnType<typeof parseControlOpener>>;
};

function span(entry: ControlEntry): ControlBlockSpan {
  return { start: entry.start, end: entry.end, raw: entry.raw };
}

function parseError(path: string | undefined, message: string): never {
  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message },
  });
}

function collectControlEntries(source: string, path?: string): ControlEntry[] {
  const entries: ControlEntry[] = [];

  for (const block of scanHgBlocks(source)) {
    const opener = parseControlOpener(block.inner, path);
    if (opener) {
      entries.push({
        start: block.start,
        end: block.end,
        raw: block.raw,
        opener,
      });
    }
  }

  return entries;
}

function isOpener(opener: ControlEntry["opener"]): boolean {
  return opener.kind === "if" || opener.kind === "each";
}

export function parseControlStructures(
  source: string,
  path?: string,
): ControlNode[] {
  const entries = collectControlEntries(source, path);
  if (entries.length === 0) {
    return source.length > 0 ? [{ kind: "text", content: source }] : [];
  }

  const { nodes, nextIndex } = parseNodes(source, entries, 0, entries.length, path);
  if (nextIndex < entries.length) {
    const orphan = entries[nextIndex]!;
    if (orphan.opener.kind === "endif") {
      throw parseError(path, "endif without matching if");
    }
    if (orphan.opener.kind === "endeach") {
      throw parseError(path, "endeach without matching each");
    }
    if (orphan.opener.kind === "else" || orphan.opener.kind === "else_if") {
      throw parseError(path, "else without matching if");
    }
  }

  return nodes;
}

function parseNodes(
  source: string,
  entries: ControlEntry[],
  from: number,
  to: number,
  path?: string,
  rangeStart = 0,
  rangeEnd?: number,
): { nodes: ControlNode[]; nextIndex: number } {
  const end = rangeEnd ?? source.length;
  const nodes: ControlNode[] = [];
  let cursor = rangeStart;
  let index = from;

  while (index < to) {
    const entry = entries[index]!;

    if (entry.start >= end) {
      break;
    }

    if (entry.end <= rangeStart) {
      index++;
      continue;
    }

    if (entry.start > cursor) {
      nodes.push({
        kind: "text",
        content: source.slice(cursor, entry.start),
      });
    }

    if (entry.opener.kind === "if") {
      const parsed = parseIfStructure(source, entries, index, to, path);
      nodes.push(parsed.node);
      cursor = parsed.endPos;
      index = parsed.nextIndex;
      continue;
    }

    if (entry.opener.kind === "each") {
      const parsed = parseEachStructure(source, entries, index, to, path);
      nodes.push(parsed.node);
      cursor = parsed.endPos;
      index = parsed.nextIndex;
      continue;
    }

    if (entry.opener.kind === "else" || entry.opener.kind === "else_if") {
      throw parseError(path, "else without matching if");
    }
    if (entry.opener.kind === "endif") {
      throw parseError(path, "endif without matching if");
    }
    if (entry.opener.kind === "endeach") {
      throw parseError(path, "endeach without matching each");
    }

    index++;
  }

  if (cursor < end) {
    nodes.push({ kind: "text", content: source.slice(cursor, end) });
  }

  return { nodes, nextIndex: index };
}

function parseIfStructure(
  source: string,
  entries: ControlEntry[],
  startIndex: number,
  to: number,
  path?: string,
): { node: ControlNode; nextIndex: number; endPos: number } {
  const startEntry = entries[startIndex]!;
  if (startEntry.opener.kind !== "if") {
    throw parseError(path, "expected if");
  }

  const branches: IfBranch[] = [];
  let index = startIndex;
  let bodyStart = startEntry.end;
  let depth = 0;

  while (index < to) {
    const entry = entries[index]!;

    if (index === startIndex) {
      if (entry.opener.kind !== "if") {
        throw parseError(path, "expected if");
      }
      branches.push({
        kind: "if",
        expr: entry.opener.expr,
        opener: span(entry),
        body: [],
      });
      index++;
      continue;
    }

    if (isOpener(entry.opener)) {
      depth++;
      index++;
      continue;
    }

    if (entry.opener.kind === "endif") {
      if (depth === 0) {
        branches[branches.length - 1]!.body = parseNodes(
          source,
          entries,
          startIndex + 1,
          index,
          path,
          bodyStart,
          entry.start,
        ).nodes;
        return {
          node: { kind: "if", branches, closer: span(entry) },
          nextIndex: index + 1,
          endPos: entry.end,
        };
      }
      depth--;
      index++;
      continue;
    }

    if (entry.opener.kind === "endeach") {
      depth--;
      index++;
      continue;
    }

    if (depth === 0) {
      if (entry.opener.kind === "else_if") {
        branches[branches.length - 1]!.body = parseNodes(
          source,
          entries,
          startIndex + 1,
          index,
          path,
          bodyStart,
          entry.start,
        ).nodes;
        branches.push({
          kind: "else_if",
          expr: entry.opener.expr,
          opener: span(entry),
          body: [],
        });
        bodyStart = entry.end;
        index++;
        continue;
      }

      if (entry.opener.kind === "else") {
        branches[branches.length - 1]!.body = parseNodes(
          source,
          entries,
          startIndex + 1,
          index,
          path,
          bodyStart,
          entry.start,
        ).nodes;
        branches.push({
          kind: "else",
          opener: span(entry),
          body: [],
        });
        bodyStart = entry.end;
        index++;
        continue;
      }
    }

    index++;
  }

  throw parseError(path, "unclosed if block (missing endif)");
}

function parseEachStructure(
  source: string,
  entries: ControlEntry[],
  startIndex: number,
  to: number,
  path?: string,
): { node: ControlNode; nextIndex: number; endPos: number } {
  const startEntry = entries[startIndex]!;
  if (startEntry.opener.kind !== "each") {
    throw parseError(path, "expected each");
  }

  let index = startIndex + 1;
  const bodyStart = startEntry.end;
  let depth = 0;

  while (index < to) {
    const entry = entries[index]!;

    if (isOpener(entry.opener)) {
      depth++;
      index++;
      continue;
    }

    if (entry.opener.kind === "endeach") {
      if (depth === 0) {
        const body = parseNodes(
          source,
          entries,
          startIndex + 1,
          index,
          path,
          bodyStart,
          entry.start,
        ).nodes;
        return {
          node: {
            kind: "each",
            item: startEntry.opener.item,
            expr: startEntry.opener.expr,
            opener: span(startEntry),
            body,
            closer: span(entry),
          },
          nextIndex: index + 1,
          endPos: entry.end,
        };
      }
      depth--;
      index++;
      continue;
    }

    if (entry.opener.kind === "endif") {
      depth--;
      index++;
      continue;
    }

    index++;
  }

  throw parseError(path, "unclosed each block (missing endeach)");
}
