import { mergeContext } from "../context/mergeContext.js";
import { parseFrontMatter } from "../frontmatter/parseFrontMatter.js";
import { resolveIncludePath } from "../io/resolveIncludePath.js";
import { formatWarningMessage } from "../errors/formatMessage.js";
import { createHyogenError } from "../errors/createError.js";
import type { HyogenContext, HyogenWarning, Loader } from "../types.js";
import { VisitStack } from "../include/VisitStack.js";
import { scanHgBlocks } from "../parse/scanHgBlocks.js";
import { extractHgBlockLines } from "../logic/hgBlockUtils.js";
import { parseExtendDirective } from "./parseExtendDirective.js";
import { parseBlockStructures } from "./parseBlockStructures.js";
import type { BlockStructure } from "./parseBlockStructures.js";
import { joinRemovalSeam } from "../pipeline/joinRemovalSeam.js";

export type ExpandExtendsAndBlocksOptions = {
  path?: string;
  context: HyogenContext;
  /** Only the updated bindings after `executeDeclarations` (child wins when merging) */
  declarationUpdates: HyogenContext;
  loader?: Loader;
  root?: string;
  constrainToRoot?: boolean;
  visitStack: VisitStack;
  warnings?: HyogenWarning[];
  inComponent?: boolean;
};

export type ExpandExtendsAndBlocksResult = {
  source: string;
  context: HyogenContext;
};

function findExtendDirectiveBlocks(source: string): Array<{ path: string; start: number }> {
  const blocks = scanHgBlocks(source);
  const extendsFound: Array<{ path: string; start: number }> = [];

  for (const block of blocks) {
    const lines = extractHgBlockLines(block.inner);
    if (lines.length === 0) continue;
    const extend = parseExtendDirective(lines[0]!);
    if (extend) {
      extendsFound.push({ path: extend.path, start: block.start });
    }
  }

  return extendsFound;
}

function findBlockLikeDirectives(source: string): boolean {
  const blocks = scanHgBlocks(source);
  for (const block of blocks) {
    const lines = extractHgBlockLines(block.inner);
    if (lines.length !== 1) continue;
    const line = lines[0]!;
    if (line === "endblock") return true;
    if (line.startsWith("block ")) return true;
  }
  return false;
}

function createSkipOutput(childBlocks: BlockStructure[]): string {
  return childBlocks.map((b) => b.body).join("");
}

function mergeLayoutWithBlocks(layoutSource: string, layoutBlocks: BlockStructure[], childBlocksByName: Map<string, string>): string {
  const sorted = [...layoutBlocks].sort((a, b) => a.start - b.start);

  // Alternate layout slices and block bodies. Each junction is an opener or
  // closer removal, so join with the shared seam rule (max newlines).
  const parts: string[] = [];
  let cursor = 0;
  for (const block of sorted) {
    parts.push(layoutSource.slice(cursor, block.start));
    parts.push(childBlocksByName.get(block.name) ?? block.body);
    cursor = block.end;
  }
  parts.push(layoutSource.slice(cursor));
  return parts.reduce((acc, part) => joinRemovalSeam(acc, part));
}

function updateViaForLoaderErrors(
  error: unknown,
): { errorToThrow: unknown; adjusted: boolean } {
  // Best-effort: keep the original code but adjust `{via}` in details/message.
  if (error instanceof Error && "code" in error && "details" in error) {
    const anyErr = error as { code?: string; details?: { via?: string }; message?: string };
    if (
      anyErr.code === "file_not_found" &&
      anyErr.details &&
      anyErr.details.via === "include"
    ) {
      anyErr.details.via = "extend";
      // message will be updated by caller when creating a new one.
      return { errorToThrow: anyErr, adjusted: true };
    }
  }
  return { errorToThrow: error, adjusted: false };
}

export async function expandExtendsAndBlocks(
  source: string,
  options: ExpandExtendsAndBlocksOptions,
): Promise<ExpandExtendsAndBlocksResult> {
  const {
    path,
    context,
    declarationUpdates,
    loader,
    root,
    constrainToRoot,
    visitStack,
    warnings,
    inComponent = false,
  } = options;

  const extendBlocks = findExtendDirectiveBlocks(source);
  if (extendBlocks.length === 0) {
    // No `extend`: v0.4 treats orphan `block` as a parse error.
    if (findBlockLikeDirectives(source)) {
      throw createHyogenError({
        code: "parse_error",
        path,
        details: { message: "orphan block without extend" },
      });
    }
    return { source, context: mergeContext(context, declarationUpdates) };
  }

  // v0.4: extend must be the first @hg block in this document.
  const allHgBlocks = scanHgBlocks(source);
  const first = allHgBlocks[0];
  if (!first) {
    return { source, context: mergeContext(context, declarationUpdates) };
  }

  if (!loader) {
    throw new Error("loader is required when processing extend directives");
  }

  const firstLines = extractHgBlockLines(first.inner);
  const firstExtend = firstLines.length > 0 ? parseExtendDirective(firstLines[0]!) : null;
  if (!firstExtend) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "extend must be the first hyogen block" },
    });
  }

  if (extendBlocks.length > 1) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "multiple extend directives are not supported" },
    });
  }

  // Child blocks are used for merging (or for skip output in warnings).
  const childBlocks = parseBlockStructures(source, {
    path,
    mode: "child",
    hasExtend: true,
  });

  if (inComponent) {
    warnings?.push({
      code: "extend_in_component",
      message: formatWarningMessage("extend_in_component", { path }),
      path,
      details: { path },
    });

    return {
      source: createSkipOutput(childBlocks),
      context: mergeContext(context, declarationUpdates),
    };
  }

  const extendPath = extendBlocks[0]!.path;
  const currentVisitPath = path;

  const layoutAbs = resolveIncludePath(
    root,
    extendPath,
    path,
    path,
    constrainToRoot,
    true,
  );

  // Push the current document onto the visit stack for correct circular detection.
  if (currentVisitPath) {
    visitStack.push(currentVisitPath);
  }

  try {
    const circular = currentVisitPath
      ? visitStack.check(layoutAbs)
      : { circular: false as const };

    if (circular.circular) {
      warnings?.push({
        code: "circular_include",
        message: formatWarningMessage("circular_include", {
          path: layoutAbs,
          from: circular.from,
          via: "extend",
        }),
        path,
        details: { path: layoutAbs, from: circular.from, via: "extend" },
      });

      return {
        source: createSkipOutput(childBlocks),
        context: mergeContext(context, declarationUpdates),
      };
    }

    visitStack.push(layoutAbs);
    try {
      const layoutSourceRaw = await loader(layoutAbs);

      // Best-effort: if the caller passed a loader created for `include`,
      // adjust error `via` for `extend` semantics.
      // (Only message/details are tweaked; behavior stays unchanged.)
      if (layoutSourceRaw === (undefined as unknown as string)) {
        throw new Error("loader returned undefined");
      }

      const { context: layoutContext, body: layoutBody } = parseFrontMatter(
        layoutSourceRaw,
        layoutAbs,
      );

      // Multi-inheritance is unsupported: `extend` inside a layout is an error,
      // except when it immediately forms a circular reference.
      const layoutExtends = findExtendDirectiveBlocks(layoutBody);
      if (layoutExtends.length > 0) {
        const nestedExtendPath = layoutExtends[0]!.path;
        const nestedAbs = resolveIncludePath(
          root,
          nestedExtendPath,
          layoutAbs,
          layoutAbs,
          constrainToRoot,
          true,
        );
        const nestedCircular = visitStack.check(nestedAbs);
        if (nestedCircular.circular) {
          warnings?.push({
            code: "circular_include",
            message: formatWarningMessage("circular_include", {
              path: nestedAbs,
              from: nestedCircular.from,
              via: "extend",
            }),
            path,
            details: { path: nestedAbs, from: nestedCircular.from, via: "extend" },
          });

          return {
            source: createSkipOutput(childBlocks),
            context: mergeContext(context, declarationUpdates),
          };
        }

        throw createHyogenError({
          code: "parse_error",
          path: layoutAbs,
          details: { message: "layout extend is not supported" },
        });
      }

      const layoutBlocks = parseBlockStructures(layoutBody, {
        path: layoutAbs,
        mode: "layout",
      });

      const childBlocksByName = new Map<string, string>(
        childBlocks.map((b) => [b.name, b.body]),
      );

      const mergedSource = mergeLayoutWithBlocks(
        layoutBody,
        layoutBlocks,
        childBlocksByName,
      );

      const mergedContext = mergeContext(
        context,
        layoutContext,
        declarationUpdates,
      );

      return { source: mergedSource, context: mergedContext };
    } finally {
      visitStack.pop();
    }
  } catch (error) {
    // Adjust `via` in loader errors when possible.
    const adjusted = updateViaForLoaderErrors(error);
    if (adjusted.adjusted) {
      // Recreate message with updated details so assertions can inspect it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw adjusted.errorToThrow;
    }
    throw error;
  } finally {
    if (currentVisitPath) {
      visitStack.pop();
    }
  }
}

