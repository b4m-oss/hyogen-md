import type { HyogenContext } from "hyogen-md/client";
import { isUnderscoreEntry } from "../fs/isUnderscoreEntry";
import { isSrcPath } from "../fs/paths";
import type { VirtualFs } from "../fs/virtualFs";
import { renderOpenFile, type RenderOpenResult } from "./renderOpenFile";

export type RenderSrcTreeToOutResult = {
  /** Non-underscore src files that were attempted. */
  paths: string[];
  results: RenderOpenResult[];
};

/**
 * Walk `rootSrcPath` (file or directory) and render each non-underscore
 * src **file** into `/out` via `renderOpenFile`. Underscore paths are skipped.
 * Callers should `persist` / bump the tree once after this returns.
 */
export async function renderSrcTreeToOut(
  fs: VirtualFs,
  rootSrcPath: string,
  context: HyogenContext = {},
): Promise<RenderSrcTreeToOutResult> {
  if (!isSrcPath(rootSrcPath)) {
    throw new Error(`EINVAL: renderSrcTreeToOut requires /src path: ${rootSrcPath}`);
  }
  if (!fs.exists(rootSrcPath)) {
    throw new Error(`ENOENT: ${rootSrcPath}`);
  }

  const paths = collectNonUnderscoreSrcFiles(fs, rootSrcPath);
  const results: RenderOpenResult[] = [];
  for (const srcPath of paths) {
    results.push(await renderOpenFile({ fs, srcPath, context }));
  }
  return { paths, results };
}

function collectNonUnderscoreSrcFiles(fs: VirtualFs, root: string): string[] {
  const out: string[] = [];
  const visit = (path: string) => {
    if (isUnderscoreEntry(path)) return;
    const kind = fs.statKind(path);
    if (kind === "file") {
      out.push(path);
      return;
    }
    if (kind !== "directory") return;
    for (const child of fs.listTree(path)) {
      visit(child.path);
    }
  };
  visit(root);
  return out;
}
