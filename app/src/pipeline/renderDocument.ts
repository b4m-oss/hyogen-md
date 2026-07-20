import type {
  HyogenContext,
  RenderOptions,
  RenderResult,
} from "../types.js";
import { mergeContext } from "../context/mergeContext.js";
import { parseFrontMatter } from "../frontmatter/parseFrontMatter.js";
import { interpolateExpressions } from "../expr/interpolateExpressions.js";
import { expandIncludes } from "../include/expandIncludes.js";
import { executeHgBlocks } from "./executeHgBlocks.js";
import { applyFrontMatterOutputOption } from "./applyFrontMatterOutputOption.js";
import { stripHgComments } from "./stripHgComments.js";

export type RenderDocumentOptions = RenderOptions & {
  path?: string;
  context?: HyogenContext;
};

export async function renderDocument(
  source: string,
  options: RenderDocumentOptions = {},
): Promise<RenderResult> {
  const path = options.path;
  const mergedInputContext = mergeContext(options.context);

  const { context: fmContext, body, rawFrontMatter } = parseFrontMatter(
    source,
    path,
  );
  const context = mergeContext(mergedInputContext, fmContext);

  const { source: afterHg, directives } = executeHgBlocks(body, path);

  const loader = options.loader;
  if (directives.length > 0 && !loader) {
    throw new Error("loader is required when processing include directives");
  }

  let markdown = afterHg;
  if (directives.length > 0 && loader) {
    markdown = await expandIncludes({
      source: afterHg,
      directives,
      context,
      loader,
      root: options.root,
      path,
      preserveFrontMatter: options.preserveFrontMatter,
      preserveHgComments: options.preserveHgComments,
    });
  }

  markdown = interpolateExpressions(markdown, context, path);
  markdown = stripHgComments(markdown, options.preserveHgComments);
  markdown = applyFrontMatterOutputOption(markdown, {
    preserveFrontMatter: options.preserveFrontMatter,
    rawFrontMatter,
  });

  return {
    markdown,
    warnings: [],
  };
}

export type RenderChildDocumentOptions = Omit<
  RenderDocumentOptions,
  "context"
> & {
  context: HyogenContext;
};

/** Renders an included child document through the full v0.1 pipeline (Option A). */
export async function renderChildDocument(
  source: string,
  options: RenderChildDocumentOptions,
): Promise<string> {
  const path = options.path;
  const { context: fmContext, body } = parseFrontMatter(source, path);
  const context = mergeContext(options.context, fmContext);

  const { source: afterHg, directives } = executeHgBlocks(body, path);

  let markdown = afterHg;
  if (directives.length > 0) {
    markdown = await expandIncludes({
      source: afterHg,
      directives,
      context,
      loader: options.loader!,
      root: options.root,
      path,
      preserveFrontMatter: false,
      preserveHgComments: options.preserveHgComments,
    });
  }

  markdown = interpolateExpressions(markdown, context, path);
  markdown = stripHgComments(markdown, options.preserveHgComments);

  return markdown;
}
