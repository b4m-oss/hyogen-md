import { isUnderscoreEntry } from "./isUnderscoreEntry";
import {
  isOutPath,
  isSrcPath,
  OUT_ROOT,
  parentPath,
  srcToOut,
} from "./paths";
import type { VirtualFs } from "./virtualFs";

/**
 * After SRC `rename(fromSrc, toSrc)`, sync the mirrored `/out` tree.
 * Pass the pre-rename `fromSrc` and post-rename `toSrc` path strings.
 */
export function syncOutAfterSrcRename(
  fs: VirtualFs,
  fromSrc: string,
  toSrc: string,
): void {
  if (!isSrcPath(fromSrc) || !isSrcPath(toSrc)) {
    throw new Error(
      `EINVAL: syncOutAfterSrcRename requires /src paths: ${fromSrc} -> ${toSrc}`,
    );
  }
  if (fromSrc === "/src" || toSrc === "/src") {
    return;
  }

  const fromOut = srcToOut(fromSrc);
  const toOut = srcToOut(toSrc);

  if (isUnderscoreEntry(toSrc)) {
    removeOutTree(fs, fromOut);
    return;
  }

  if (isUnderscoreEntry(fromSrc)) {
    return;
  }

  if (!fs.exists(fromOut)) {
    return;
  }

  fs.rename(fromOut, toOut);
}

function removeOutTree(fs: VirtualFs, root: string): void {
  if (!isOutPath(root) || root === OUT_ROOT || !fs.exists(root)) {
    return;
  }

  const paths = collectSubtreePaths(fs, root).sort((a, b) => b.length - a.length);
  for (const p of paths) {
    if (!fs.exists(p)) continue;
    try {
      fs.remove(p);
    } catch {
      /* ENOTEMPTY until children gone; deepest-first usually avoids this */
    }
  }

  // Retry remaining dirs deepest-first.
  const remaining = collectSubtreePaths(fs, root).sort((a, b) => b.length - a.length);
  for (const p of remaining) {
    if (!fs.exists(p)) continue;
    try {
      fs.remove(p);
    } catch {
      /* ignore */
    }
  }

  removeEmptyOutAncestors(fs, root);
}

function collectSubtreePaths(fs: VirtualFs, root: string): string[] {
  const out: string[] = [];
  const visit = (path: string) => {
    out.push(path);
    if (fs.statKind(path) !== "directory") return;
    for (const child of fs.listTree(path)) {
      visit(child.path);
    }
  };
  visit(root);
  return out;
}

function removeEmptyOutAncestors(fs: VirtualFs, filePath: string): void {
  let dir = parentPath(filePath);
  while (dir !== OUT_ROOT && dir !== "/" && isOutPath(dir)) {
    if (!fs.exists(dir)) {
      dir = parentPath(dir);
      continue;
    }
    try {
      fs.remove(dir);
    } catch {
      break;
    }
    dir = parentPath(dir);
  }
}
