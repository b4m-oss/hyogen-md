import { createHyogenError } from "../errors/createError.js";
import { scanHgBlocks } from "../parse/scanHgBlocks.js";
import { extractHgBlockLines } from "../logic/hgBlockUtils.js";
import { parseBlockOpener } from "./parseBlockOpener.js";

export type BlockStructure = {
  name: string;
  body: string;
  /** span start (includes opener) */
  start: number;
  /** span end (includes closer) */
  end: number;
};

export type ParseBlockStructuresOptions = {
  path?: string;
  mode: "layout" | "child";
  /** child parsing rule: blocks are only allowed when extend exists */
  hasExtend?: boolean;
};

export function parseBlockStructures(
  source: string,
  options: ParseBlockStructuresOptions,
): BlockStructure[] {
  const { path: errPath, mode, hasExtend = false } = options;
  const blocks = scanHgBlocks(source);
  if (blocks.length === 0) return [];

  const results: BlockStructure[] = [];
  const openStack: Array<{ name: string; openerEnd: number; start: number }> = [];
  const seenNames = new Set<string>();

  for (const block of blocks) {
    const lines = extractHgBlockLines(block.inner);
    if (lines.length !== 1) continue;

    const line = lines[0]!;
    const looksLikeBlock =
      line === "endblock" || line.startsWith("block ");

    if (!looksLikeBlock) continue;

    if (mode === "child" && !hasExtend) {
      throw createHyogenError({
        code: "parse_error",
        path: errPath,
        details: { message: "orphan block without extend" },
      });
    }

    const opener = parseBlockOpener(line, errPath);
    if (opener.kind === "endblock") {
      const openerNode = openStack.pop();
      if (!openerNode) {
        throw createHyogenError({
          code: "parse_error",
          path: errPath,
          details: { message: "endblock without matching block opener" },
        });
      }

      const body = source.slice(openerNode.openerEnd, block.start);
      results.push({
        name: openerNode.name,
        body,
        start: openerNode.start,
        end: block.end,
      });
      continue;
    }

    // opener.kind === "block"
    if (openStack.length > 0) {
      throw createHyogenError({
        code: "parse_error",
        path: errPath,
        details: { message: "nested block structures are not supported" },
      });
    }

    if (seenNames.has(opener.name)) {
      throw createHyogenError({
        code: "parse_error",
        path: errPath,
        details: { message: `duplicate block: ${opener.name}` },
      });
    }

    seenNames.add(opener.name);
    openStack.push({
      name: opener.name,
      openerEnd: block.end,
      start: block.start,
    });
  }

  if (openStack.length > 0) {
    throw createHyogenError({
      code: "parse_error",
      path: errPath,
      details: { message: "missing endblock" },
    });
  }

  return results;
}

