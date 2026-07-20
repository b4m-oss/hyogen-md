import { mergeContext } from "./context/mergeContext.js";
import { createFsLoader } from "./io/createFsLoader.js";
import { renderDocument } from "./pipeline/renderDocument.js";
import type { HyogenContext, RenderResult, ServerRenderOptions } from "./types.js";

export async function renderServer(
  source: string,
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult> {
  const mergedContext = mergeContext(context, options?.serverContext);
  const loader = options?.loader ?? createFsLoader();

  return renderDocument(source, {
    context: mergedContext,
    loader,
    root: options?.root,
    preserveFrontMatter: options?.preserveFrontMatter,
    preserveHgComments: options?.preserveHgComments,
  });
}
