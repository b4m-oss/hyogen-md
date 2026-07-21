import { createHyogenError } from "./errors/createError.js";
import { mergeContext } from "./context/mergeContext.js";
import { renderDocument } from "./pipeline/renderDocument.js";
import type {
  DataSourcesMap,
  HyogenContext,
  RenderOptions,
  RenderResult,
} from "./types.js";

type ClientRenderOptions = RenderOptions & {
  /** Rejected on client — use renderServer/build instead */
  serverContext?: HyogenContext;
  /** Rejected on client — use renderServer/build instead */
  dataSources?: DataSourcesMap;
};

/**
 * Client-side render entry. Requires an injected loader; never uses
 * createNodeLoader / resolveRenderInput (no FS or network in the library).
 */
export async function renderClient(
  input: string | { path: string },
  context?: HyogenContext,
  options?: ClientRenderOptions,
): Promise<RenderResult> {
  if (
    options != null &&
    "serverContext" in options &&
    options.serverContext != null
  ) {
    throw createHyogenError({
      code: "server_context_on_client",
    });
  }

  if (
    options != null &&
    "dataSources" in options &&
    options.dataSources != null &&
    Object.keys(options.dataSources).length > 0
  ) {
    throw createHyogenError({
      code: "data_sources_on_client",
    });
  }

  const loader = options?.loader;
  if (!loader) {
    throw createHyogenError({
      code: "parse_error",
      details: { message: "loader is required for renderClient" },
    });
  }

  let source: string;
  let entryPath: string | undefined;

  if (typeof input === "string") {
    source = input;
  } else {
    entryPath = input.path;
    source = await loader(input.path);
  }

  const mergedContext = mergeContext(context);

  return renderDocument(source, {
    context: mergedContext,
    loader,
    root: options?.root,
    path: entryPath ?? options?.path,
    preserveFrontMatter: options?.preserveFrontMatter,
    preserveHgComments: options?.preserveHgComments,
    constrainToRoot: options?.constrainToRoot,
  });
}
