import { createHyogenError } from "../errors/createError.js";
import {
  extractHgBlockLines,
  isControlDirectiveLine,
} from "../logic/hgBlockUtils.js";
import { isDeclarationSource } from "../logic/parseDeclaration.js";
import { parseComponentDirective } from "../parse/parseComponentDirective.js";
import { parseIncludeDirective } from "../parse/parseIncludeDirective.js";
import { findUnclosedHgBlock, scanHgBlocks } from "../parse/scanHgBlocks.js";
import { parseExtendDirective } from "../layout/parseExtendDirective.js";

export type DependencyRef = {
  kind: "include" | "component" | "extend";
  path: string;
};

/**
 * Statically collect include / component / extend paths from a source string.
 */
export function collectDependencies(
  source: string,
  fromPath?: string,
): DependencyRef[] {
  if (findUnclosedHgBlock(source)) {
    throw createHyogenError({
      code: "parse_error",
      path: fromPath,
      details: { message: "unclosed @hg block (missing @endhg)" },
    });
  }

  const deps: DependencyRef[] = [];
  const blocks = scanHgBlocks(source);

  for (const block of blocks) {
    const lines = extractHgBlockLines(block.inner);
    if (lines.length === 0) {
      throw createHyogenError({
        code: "parse_error",
        path: fromPath,
        details: { message: "empty hyogen block" },
      });
    }

    if (lines.length === 1 && isControlDirectiveLine(lines[0]!)) {
      continue;
    }

    if (lines.length === 1 && isDeclarationSource(lines[0]!)) {
      continue;
    }

    const first = lines[0]!;

    if (first === "endblock" || /^block\s+/.test(first)) {
      continue;
    }

    const extend = parseExtendDirective(first, fromPath);
    if (extend) {
      deps.push({ kind: "extend", path: extend.path });
      continue;
    }

    if (lines.length !== 1) {
      // Multi-line: allow declaration blocks (const/let lines) and extend+decls
      const allDeclarations = lines.every(
        (line) =>
          isDeclarationSource(line) ||
          parseExtendDirective(line) !== null,
      );
      if (allDeclarations) {
        continue;
      }
      throw createHyogenError({
        code: "parse_error",
        path: fromPath,
        details: { message: "hyogen block must contain a single directive" },
      });
    }

    if (/^include\s+/i.test(first)) {
      const include = parseIncludeDirective(block.inner, fromPath);
      deps.push({ kind: "include", path: include.path });
      continue;
    }

    if (/^component\s+/i.test(first)) {
      const component = parseComponentDirective(block.inner, fromPath);
      deps.push({ kind: "component", path: component.path });
      continue;
    }

    throw createHyogenError({
      code: "parse_error",
      path: fromPath,
      details: { message: `unsupported hyogen directive: ${first}` },
    });
  }

  return deps;
}
