import { readFile, stat } from "node:fs/promises";
import { createHyogenError } from "../errors/createError.js";
import type { HyogenError, Loader } from "../types.js";

export type FsLoaderOptions = {
  from?: string;
  via?: "include" | "component" | "extend";
};

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

export function createFsLoader(options: FsLoaderOptions = {}): Loader {
  const { from, via = "include" } = options;

  return async (filePath: string): Promise<string> => {
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        throw createHyogenError({
          code: "load_failed",
          path: from,
          details: {
            path: filePath,
            reason: "not a file",
          },
        });
      }

      return await readFile(filePath, "utf8");
    } catch (error) {
      if (isHyogenError(error)) {
        throw error;
      }

      const errno = error as NodeJS.ErrnoException;
      if (errno.code === "ENOENT") {
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
          reason: errno.message ?? "unknown load error",
        },
      });
    }
  };
}
