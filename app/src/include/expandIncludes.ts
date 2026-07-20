import { formatWarningMessage } from "../errors/formatMessage.js";
import { resolveIncludePath } from "../io/resolveIncludePath.js";
import { renderChildDocument } from "../pipeline/renderDocument.js";
import type { ComponentRegistry } from "../component/ComponentRegistry.js";
import type { VisitStack } from "./VisitStack.js";
import type { HyogenContext, HyogenWarning, IncludeDirective, Loader } from "../types.js";

export type ExpandIncludesOptions = {
  source: string;
  directives: IncludeDirective[];
  context: HyogenContext;
  loader: Loader;
  root?: string;
  path?: string;
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
  visitStack?: VisitStack;
  warnings?: HyogenWarning[];
  registry?: ComponentRegistry;
  constrainToRoot?: boolean;
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
      options.path,
      options.constrainToRoot,
      true,
    );

    if (options.visitStack) {
      const circular = options.visitStack.check(absolutePath);
      if (circular.circular) {
        options.warnings?.push({
          code: "circular_include",
          message: formatWarningMessage("circular_include", {
            path: absolutePath,
            from: circular.from,
            via: "include",
          }),
          path: options.path,
          details: {
            path: absolutePath,
            from: circular.from,
            via: "include",
          },
        });
        result = result.replace(directive.marker, "");
        continue;
      }
      options.visitStack.push(absolutePath);
    }

    try {
      const childSource = await options.loader(absolutePath);

      const childMarkdown = await renderChildDocument(childSource, {
        context: options.context,
        loader: options.loader,
        root: options.root,
        path: absolutePath,
        preserveFrontMatter: options.preserveFrontMatter,
        preserveHgComments: options.preserveHgComments,
        visitStack: options.visitStack,
        warnings: options.warnings,
        registry: options.registry,
      });

      const replacement =
        options.preserveHgComments && directive.raw
          ? `${directive.raw}\n${childMarkdown}`
          : childMarkdown;

      result = result.replace(directive.marker, replacement);
    } finally {
      options.visitStack?.pop();
    }
  }

  return result;
}
