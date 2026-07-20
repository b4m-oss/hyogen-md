import path from "node:path";
import { isRemotePath } from "../io/isRemotePath.js";
import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";
import type { Loader } from "../types.js";
import { collectDependencies, type DependencyRef } from "./collectDependencies.js";

export type DependencyEdge = {
  from: string;
  to: string;
  kind: DependencyRef["kind"];
};

export type DependencyGraph = {
  entries: string[];
  dependencies: string[];
  nodes: string[];
  edges: DependencyEdge[];
};

export type BuildDependencyGraphOptions = {
  root?: string;
  constrainToRoot?: boolean;
};

function resolveDepPath(
  depPath: string,
  fromPath: string,
  options: BuildDependencyGraphOptions,
): string {
  if (isRemotePath(depPath)) {
    return depPath;
  }
  return resolveTemplatePath(depPath, {
    rootDir: options.root,
    fromPath,
    documentPath: fromPath,
    constrainToRoot: options.constrainToRoot,
    hyogenPath: true,
  });
}

/**
 * Walk entries BFS collecting include/component/extend dependencies.
 * Missing deps throw via loader (`file_not_found`).
 */
export async function buildDependencyGraph(
  entries: string[],
  loader: Loader,
  options: BuildDependencyGraphOptions = {},
): Promise<DependencyGraph> {
  const entryAbs = entries.map((e) =>
    isRemotePath(e) ? e : path.resolve(e),
  );
  const entrySet = new Set(entryAbs);
  const visited = new Set<string>();
  const edges: DependencyEdge[] = [];
  const queue = [...entryAbs];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const source = await loader(current);
    const deps = collectDependencies(source, current);

    for (const dep of deps) {
      const resolved = resolveDepPath(dep.path, current, options);
      edges.push({ from: current, to: resolved, kind: dep.kind });
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  const nodes = [...visited];
  const dependencies = nodes.filter((n) => !entrySet.has(n));

  return {
    entries: entryAbs,
    dependencies,
    nodes,
    edges,
  };
}
