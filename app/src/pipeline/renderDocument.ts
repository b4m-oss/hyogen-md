import type {
  HyogenContext,
  HyogenWarning,
  RenderOptions,
  RenderResult,
} from "../types.js";
import { ComponentRegistry } from "../component/ComponentRegistry.js";
import { mergeContext } from "../context/mergeContext.js";
import { parseFrontMatter } from "../frontmatter/parseFrontMatter.js";
import { expandControlStructures } from "../control/expandControlStructures.js";
import { interpolateExpressions } from "../expr/interpolateExpressions.js";
import { expandIncludes } from "../include/expandIncludes.js";
import { VisitStack } from "../include/VisitStack.js";
import { executeDeclarations } from "../logic/executeDeclarations.js";
import { executeHgBlocks } from "./executeHgBlocks.js";
import { applyFrontMatterOutputOption } from "./applyFrontMatterOutputOption.js";
import { stripHgComments } from "./stripHgComments.js";

export type RenderDocumentOptions = RenderOptions & {
  path?: string;
  context?: HyogenContext;
  registry?: ComponentRegistry;
  warnings?: HyogenWarning[];
  visitStack?: VisitStack;
};

export type RenderDocumentBodyOptions = RenderDocumentOptions & {
  context: HyogenContext;
};

export async function renderDocumentBody(
  body: string,
  options: RenderDocumentBodyOptions,
): Promise<string> {
  const path = options.path;
  const context = options.context;
  const registry = options.registry ?? new ComponentRegistry();
  const warnings = options.warnings ?? [];
  const visitStack = options.visitStack ?? new VisitStack();

  const { source: afterDeclarations, context: declarationContext } =
    await executeDeclarations(body, { path, context: { ...context } });

  const { source: afterHg, directives } = executeHgBlocks(afterDeclarations, {
    path,
    registry,
    context: declarationContext,
  });

  const loader = options.loader;
  if (directives.length > 0 && !loader) {
    throw new Error("loader is required when processing include directives");
  }

  let markdown = afterHg;
  if (directives.length > 0 && loader) {
    markdown = await expandIncludes({
      source: afterHg,
      directives,
      context: declarationContext,
      loader,
      root: options.root,
      path,
      preserveFrontMatter: options.preserveFrontMatter,
      preserveHgComments: options.preserveHgComments,
      visitStack,
      warnings,
      registry,
      constrainToRoot: options.constrainToRoot,
    });
  }

  markdown = await expandControlStructures(markdown, {
    context: declarationContext,
    path,
    registry,
    loader,
    rootDir: options.root,
    warnings,
    visitStack,
    parentContext: declarationContext,
    preserveHgComments: options.preserveHgComments,
    constrainToRoot: options.constrainToRoot,
  });

  markdown = await interpolateExpressions(markdown, declarationContext, {
    path,
    registry,
    loader,
    rootDir: options.root,
    warnings,
    visitStack,
    parentContext: declarationContext,
    preserveHgComments: options.preserveHgComments,
    constrainToRoot: options.constrainToRoot,
  });

  markdown = stripHgComments(markdown, options.preserveHgComments);
  return markdown;
}

export async function renderDocument(
  source: string,
  options: RenderDocumentOptions = {},
): Promise<RenderResult> {
  const path = options.path;
  const mergedInputContext = mergeContext(options.context);
  const registry = options.registry ?? new ComponentRegistry();
  const warnings = options.warnings ?? [];
  const visitStack = options.visitStack ?? new VisitStack();

  const { context: fmContext, body, rawFrontMatter } = parseFrontMatter(
    source,
    path,
  );
  const context = mergeContext(mergedInputContext, fmContext);

  let markdown = await renderDocumentBody(body, {
    ...options,
    context,
    registry,
    warnings,
    visitStack,
  });

  markdown = applyFrontMatterOutputOption(markdown, {
    preserveFrontMatter: options.preserveFrontMatter,
    rawFrontMatter,
  });

  return {
    markdown,
    warnings,
  };
}

export type RenderChildDocumentOptions = Omit<
  RenderDocumentOptions,
  "context"
> & {
  context: HyogenContext;
};

/** Renders an included child document through the full pipeline. */
export async function renderChildDocument(
  source: string,
  options: RenderChildDocumentOptions,
): Promise<string> {
  const path = options.path;
  const { context: fmContext, body } = parseFrontMatter(source, path);
  const context = mergeContext(options.context, fmContext);

  return renderDocumentBody(body, {
    ...options,
    context,
    preserveFrontMatter: false,
  });
}
