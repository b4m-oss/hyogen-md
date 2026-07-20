import { createHyogenError } from "../errors/createError.js";
import type { ExecuteDeclarationsResult, HyogenContext } from "../types.js";
import { findUnclosedHgBlock, scanHgBlocks } from "../parse/scanHgBlocks.js";
import { executeDeclaration } from "./executeDeclaration.js";
import {
  isDeclarationSource,
  parseDeclarationStatements,
} from "./parseDeclaration.js";
import { extractHgBlockLines, isControlDirectiveLine } from "./hgBlockUtils.js";
import { parseExtendBlock } from "../layout/parseExtendBlock.js";

export type ExecuteDeclarationsOptions = {
  path?: string;
  context?: HyogenContext;
};

export async function executeDeclarations(
  source: string,
  options: ExecuteDeclarationsOptions = {},
): Promise<ExecuteDeclarationsResult> {
  const path = options.path;
  const context = options.context ?? {};

  if (findUnclosedHgBlock(source)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "unclosed @hg block (missing @endhg)" },
    });
  }

  const blocks = scanHgBlocks(source);
  if (blocks.length === 0) {
    return { source, context, declarationUpdates: {} };
  }

  const constBindings = new Set<string>();
  const declarationUpdates: HyogenContext = {};
  let result = source;
  let offset = 0;

  for (const block of blocks) {
    const lines = extractHgBlockLines(block.inner);
    if (lines.length === 1 && isControlDirectiveLine(lines[0]!)) {
      continue;
    }

    if (lines.length === 1 && /^include\s+/i.test(lines[0]!)) {
      continue;
    }

    if (lines.length === 1 && /^component\s+/i.test(lines[0]!)) {
      continue;
    }

    const extendBlock = parseExtendBlock(block.inner, path);
    if (extendBlock) {
      if (extendBlock.declarationsSource.trim().length > 0) {
        const declarations = parseDeclarationStatements(
          extendBlock.declarationsSource,
          path,
        );
        for (const declaration of declarations) {
          await executeDeclaration(declaration, context, { path, constBindings });
          declarationUpdates[declaration.name] = context[declaration.name];
        }
      }

      // Keep the `extend <path>` directive for step 3, but remove declarations.
      const start = block.start - offset;
      const end = block.end - offset;
      const extendRaw = `<!--@hg\nextend ${extendBlock.path}\n@endhg-->`;
      result = result.slice(0, start) + extendRaw + result.slice(end);
      offset += block.raw.length - extendRaw.length;
      continue;
    }

    const body = lines.join("\n");
    if (!isDeclarationSource(body)) {
      if (lines.length === 1) {
        continue;
      }
      throw createHyogenError({
        code: "parse_error",
        path,
        details: { message: `unsupported hyogen directive: ${lines[0]}` },
      });
    }

    const declarations = parseDeclarationStatements(body, path);
    for (const declaration of declarations) {
      await executeDeclaration(declaration, context, { path, constBindings });
      declarationUpdates[declaration.name] = context[declaration.name];
    }

    const start = block.start - offset;
    const end = block.end - offset;
    result = result.slice(0, start) + result.slice(end);
    offset += block.raw.length;
  }

  return { source: result, context, declarationUpdates };
}
