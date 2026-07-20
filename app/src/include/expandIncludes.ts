import { resolveIncludePath } from "../io/resolveIncludePath.js";
import { renderChildDocument } from "../pipeline/renderDocument.js";
import type { HyogenContext, IncludeDirective, Loader } from "../types.js";

export type ExpandIncludesOptions = {
  source: string;
  directives: IncludeDirective[];
  context: HyogenContext;
  loader: Loader;
  root?: string;
  path?: string;
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
};

export async function expandIncludes(
  options: ExpandIncludesOptions,
): Promise<string> {
  let result = options.source;

  for (const directive of options.directives) {
    const absolutePath = resolveIncludePath(
      options.root,
      directive.path,
      options.path,
    );

    const childSource = await options.loader(absolutePath);

    const childMarkdown = await renderChildDocument(childSource, {
      context: options.context,
      loader: options.loader,
      root: options.root,
      path: absolutePath,
      preserveFrontMatter: options.preserveFrontMatter,
      preserveHgComments: options.preserveHgComments,
    });

    const replacement =
      options.preserveHgComments && directive.raw
        ? `${directive.raw}\n${childMarkdown}`
        : childMarkdown;

    result = result.replace(directive.marker, replacement);
  }

  return result;
}
