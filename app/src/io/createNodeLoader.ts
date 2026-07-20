import { createFsLoader, type FsLoaderOptions } from "./createFsLoader.js";
import { createHyogenError } from "../errors/createError.js";
import { isRemotePath } from "./isRemotePath.js";
import type { HyogenError, Loader } from "../types.js";

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

export type NodeLoaderOptions = FsLoaderOptions;

export function createNodeLoader(options: NodeLoaderOptions = {}): Loader {
  const { from, via = "include" } = options;
  const fsLoader = createFsLoader(options);

  return async (filePath: string): Promise<string> => {
    if (!isRemotePath(filePath)) {
      return fsLoader(filePath);
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        if (response.status === 404) {
          throw createHyogenError({
            code: "file_not_found",
            path: from,
            details: {
              path: filePath,
              from: from ?? filePath,
              via,
            },
          });
        }
        throw createHyogenError({
          code: "load_failed",
          path: from,
          details: {
            path: filePath,
            reason: `HTTP ${response.status}`,
          },
        });
      }
      return await response.text();
    } catch (error) {
      if (isHyogenError(error)) {
        throw error;
      }
      const reason =
        error instanceof Error ? error.message : "unknown fetch error";
      throw createHyogenError({
        code: "load_failed",
        path: from,
        details: {
          path: filePath,
          reason,
        },
      });
    }
  };
}
