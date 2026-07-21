import path from "node:path";
import { createNodeLoader } from "./createNodeLoader.js";
import { parseDataFile } from "./parseDataFile.js";
import { createHyogenError } from "../errors/createError.js";
import { findDocRoot } from "../paths/findDocRoot.js";
import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";
import type { DataSourcesMap, HyogenContext, HyogenError, Loader } from "../types.js";

export type LoadDataSourcesOptions = {
  root?: string;
  loader?: Loader;
};

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

function resolveDataRoot(options?: LoadDataSourcesOptions): string {
  if (options?.root) {
    return path.resolve(options.root);
  }
  return findDocRoot(process.cwd()) ?? process.cwd();
}

export async function loadDataSources(
  sources: DataSourcesMap,
  options?: LoadDataSourcesOptions,
): Promise<HyogenContext> {
  const rootDir = resolveDataRoot(options);
  const loader = options?.loader ?? createNodeLoader();
  const context: HyogenContext = {};

  for (const [name, relativePath] of Object.entries(sources)) {
    const resolvedPath = resolveTemplatePath(relativePath, { rootDir });
    let source: string;
    try {
      source = await loader(resolvedPath);
    } catch (error) {
      if (isHyogenError(error)) {
        throw error;
      }
      throw createHyogenError({
        code: "load_failed",
        path: resolvedPath,
        details: {
          path: resolvedPath,
          reason: error instanceof Error ? error.message : "unknown load error",
        },
      });
    }
    context[name] = await parseDataFile(source, resolvedPath);
  }

  return context;
}
