import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHyogenError } from "../errors/createError.js";
import { findDocRoot } from "./findDocRoot.js";

export type ResolvedRenderInput = {
  source: string;
  rootDir?: string;
  entryPath?: string;
  constrainToRoot?: boolean;
};

export async function resolveRenderInput(
  input: string | { path: string },
  options?: { root?: string },
): Promise<ResolvedRenderInput> {
  if (typeof input === "string") {
    return {
      source: input,
      rootDir: options?.root,
    };
  }

  const entryPath = path.resolve(input.path);

  let fileStat;
  try {
    fileStat = await stat(entryPath);
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      throw createHyogenError({
        code: "file_not_found",
        path: entryPath,
        details: {
          path: entryPath,
          from: entryPath,
          via: "include",
        },
      });
    }
    throw createHyogenError({
      code: "load_failed",
      path: entryPath,
      details: {
        path: entryPath,
        reason: errno.message ?? "unknown load error",
      },
    });
  }

  if (!fileStat.isFile()) {
    throw createHyogenError({
      code: "parse_error",
      path: entryPath,
      details: { message: "path is not a file" },
    });
  }

  let source: string;
  try {
    source = await readFile(entryPath, "utf8");
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    throw createHyogenError({
      code: "load_failed",
      path: entryPath,
      details: {
        path: entryPath,
        reason: errno.message ?? "unknown load error",
      },
    });
  }

  const discoveredRoot = findDocRoot(entryPath);
  const rootDir = options?.root ?? discoveredRoot;

  return {
    source,
    rootDir,
    entryPath,
    constrainToRoot: discoveredRoot !== undefined,
  };
}
