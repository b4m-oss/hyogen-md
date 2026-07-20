import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHyogenError } from "../errors/createError.js";
import { createNodeLoader } from "../io/createNodeLoader.js";
import { findDocRoot } from "../paths/findDocRoot.js";
import { renderServer } from "../renderServer.js";
import type { BuildOptions, BuildResult, HyogenError } from "../types.js";
import { buildDependencyGraph } from "./buildDependencyGraph.js";
import { collectEntryPaths } from "./collectEntryPaths.js";

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

function resolveBuildRoot(
  optionsRoot: string | undefined,
  entries: string[],
): string {
  if (optionsRoot) {
    return path.resolve(optionsRoot);
  }
  for (const entry of entries) {
    const discovered = findDocRoot(entry);
    if (discovered) {
      return discovered;
    }
  }
  if (entries.length > 0) {
    return path.dirname(path.resolve(entries[0]!));
  }
  return process.cwd();
}

export async function build(options: BuildOptions): Promise<BuildResult> {
  const entries = await collectEntryPaths(options.input, {
    root: options.root,
    includeUnderscoreEntries: options.includeUnderscoreEntries,
  });

  const rootDir = resolveBuildRoot(options.root, entries);
  const loader = options.loader ?? createNodeLoader();
  const constrainToRoot = findDocRoot(rootDir) !== undefined;

  if (entries.length > 0) {
    await buildDependencyGraph(entries, loader, {
      root: rootDir,
      constrainToRoot,
    });
  }

  const files: BuildResult["files"] = [];
  const warnings: BuildResult["warnings"] = [];

  for (const entry of entries) {
    const absoluteEntry = path.resolve(entry);
    const relativePath = path
      .relative(rootDir, absoluteEntry)
      .replace(/\\/g, "/");

    const result = await renderServer(
      { path: absoluteEntry },
      options.context,
      {
        loader,
        root: rootDir,
        serverContext: options.serverContext,
        preserveFrontMatter: options.preserveFrontMatter,
        preserveHgComments: options.preserveHgComments,
      },
    );

    const outPath = path.join(options.outDir, relativePath);
    try {
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, result.markdown, "utf8");
    } catch (error) {
      if (isHyogenError(error)) {
        throw error;
      }
      const reason =
        error instanceof Error ? error.message : "unknown write error";
      throw createHyogenError({
        code: "load_failed",
        path: outPath,
        details: {
          path: outPath,
          reason,
        },
      });
    }

    files.push({ path: relativePath, markdown: result.markdown });
    warnings.push(...result.warnings);
  }

  return { files, warnings };
}
