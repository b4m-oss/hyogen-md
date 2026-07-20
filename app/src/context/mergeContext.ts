import type { HyogenContext } from "../types.js";

/** Shallow merge; later objects win. Skips null/undefined arguments. */
export function mergeContext(...sources: (HyogenContext | null | undefined)[]): HyogenContext {
  const result: HyogenContext = {};

  for (const source of sources) {
    if (source == null) {
      continue;
    }
    Object.assign(result, source);
  }

  return result;
}
