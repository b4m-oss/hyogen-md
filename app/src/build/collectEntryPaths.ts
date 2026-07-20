import fg from "fast-glob";
import { stat } from "node:fs/promises";
import path from "node:path";
import picomatch from "picomatch";
import { createHyogenError } from "../errors/createError.js";
import { findDocRoot } from "../paths/findDocRoot.js";
import { isUnderscorePartial } from "./isUnderscorePartial.js";

export type CollectEntryPathsOptions = {
  root?: string;
  includeUnderscoreEntries?: boolean;
  cwd?: string;
};

function isGlobPattern(pattern: string): boolean {
  return picomatch.scan(pattern).isGlob;
}

function resolveCwd(options: CollectEntryPathsOptions): string {
  if (options.root) {
    return path.resolve(options.root);
  }
  if (options.cwd) {
    return path.resolve(options.cwd);
  }
  const discovered = findDocRoot(process.cwd());
  return discovered ?? process.cwd();
}

/**
 * Expand input paths/globs and apply `_` partial filtering.
 * Duplicate relative paths: last wins (no warning).
 */
export async function collectEntryPaths(
  input: string | string[],
  options: CollectEntryPathsOptions = {},
): Promise<string[]> {
  const patterns = Array.isArray(input) ? input : [input];
  const cwd = resolveCwd(options);
  const includeUnderscore = options.includeUnderscoreEntries === true;

  // Map relative → absolute so duplicates last-win by relative key
  const byRelative = new Map<string, string>();

  for (const pattern of patterns) {
    if (!isGlobPattern(pattern)) {
      const absolute = path.isAbsolute(pattern)
        ? path.resolve(pattern)
        : path.resolve(cwd, pattern);

      try {
        const fileStat = await stat(absolute);
        if (!fileStat.isFile()) {
          throw createHyogenError({
            code: "file_not_found",
            path: absolute,
            details: {
              path: absolute,
              from: absolute,
              via: "include",
            },
          });
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          (error as { code: string }).code === "file_not_found"
        ) {
          throw error;
        }
        const errno = error as NodeJS.ErrnoException;
        if (errno.code === "ENOENT") {
          throw createHyogenError({
            code: "file_not_found",
            path: absolute,
            details: {
              path: absolute,
              from: absolute,
              via: "include",
            },
          });
        }
        throw error;
      }

      // Explicit literal paths always included (even underscore)
      const relative = path.relative(cwd, absolute).replace(/\\/g, "/");
      byRelative.set(relative, absolute);
      continue;
    }

    const matches = await fg(pattern, {
      cwd,
      absolute: true,
      onlyFiles: true,
      dot: false,
    });

    for (const absolute of matches) {
      const relative = path.relative(cwd, absolute).replace(/\\/g, "/");
      if (!includeUnderscore && isUnderscorePartial(relative)) {
        continue;
      }
      byRelative.set(relative, path.resolve(absolute));
    }
  }

  return [...byRelative.values()];
}
