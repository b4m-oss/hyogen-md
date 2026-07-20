import { mergeContext } from "./context/mergeContext.js";
import { createNodeLoader } from "./io/createNodeLoader.js";
import { resolveRenderInput } from "./paths/resolveRenderInput.js";
import { renderDocument } from "./pipeline/renderDocument.js";
import type { HyogenContext, RenderResult, ServerRenderOptions } from "./types.js";

export async function renderServer(
  input: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult> {
  const mergedContext = mergeContext(context, options?.serverContext);
  const loader = options?.loader ?? createNodeLoader();
  const resolved = await resolveRenderInput(input, { root: options?.root });

  return renderDocument(resolved.source, {
    context: mergedContext,
    loader,
    root: resolved.rootDir ?? options?.root,
    path: resolved.entryPath ?? options?.path,
    constrainToRoot: resolved.constrainToRoot,
    preserveFrontMatter: options?.preserveFrontMatter,
    preserveHgComments: options?.preserveHgComments,
  });
}
