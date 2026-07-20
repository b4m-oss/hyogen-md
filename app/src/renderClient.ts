import { createHyogenError } from "./errors/createError.js";
import type { HyogenContext, RenderOptions, RenderResult } from "./types.js";

type ClientRenderOptions = RenderOptions & {
  /** Rejected on client — use renderServer/build instead */
  serverContext?: HyogenContext;
};

/**
 * Client-side render entry (stub until v0.6).
 * Rejects serverContext immediately; otherwise throws not-implemented.
 */
export async function renderClient(
  _source: string | { path: string },
  _context?: HyogenContext,
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

  throw createHyogenError({
    code: "parse_error",
    details: { message: "renderClient is not implemented (available in v0.6)" },
  });
}
