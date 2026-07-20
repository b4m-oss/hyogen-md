import path from "node:path";
import { realpathSync } from "node:fs";
import { createHyogenError } from "../errors/createError.js";

function isWithinRoot(resolvedPath: string, rootDir: string): boolean {
  const relative = path.relative(rootDir, resolvedPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function assertNormalizedPathWithinRoot(
  resolvedPath: string,
  rootDir: string,
  documentPath?: string,
): void {
  const normalizedRoot = path.resolve(rootDir);
  const normalized = path.resolve(resolvedPath);
  if (!isWithinRoot(normalized, normalizedRoot)) {
    throw createHyogenError({
      code: "parse_error",
      path: documentPath,
      details: { message: "path resolves outside root directory" },
    });
  }
}

export function assertWithinRootDir(
  resolvedPath: string,
  rootDir: string,
  documentPath?: string,
): void {
  const normalizedRoot = path.resolve(rootDir);

  try {
    const actualPath = realpathSync.native(resolvedPath);
    let normalizedRootReal: string;
    try {
      normalizedRootReal = realpathSync.native(normalizedRoot);
    } catch {
      normalizedRootReal = normalizedRoot;
    }

    if (!isWithinRoot(actualPath, normalizedRootReal)) {
      throw createHyogenError({
        code: "parse_error",
        path: documentPath,
        details: { message: "path resolves outside root directory" },
      });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "parse_error"
    ) {
      throw error;
    }

    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      assertNormalizedPathWithinRoot(resolvedPath, rootDir, documentPath);
      throw createHyogenError({
        code: "file_not_found",
        path: documentPath,
        details: {
          path: resolvedPath,
          from: documentPath ?? resolvedPath,
          via: "include",
        },
      });
    }
    throw error;
  }
}
