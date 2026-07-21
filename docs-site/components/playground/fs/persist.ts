import { applyDemoSeed } from "../seed/demoSeed";
import { isUnderscoreEntry } from "./isUnderscoreEntry";
import { isOutPath, OUT_ROOT, outToSrc, parentPath } from "./paths";
import { VirtualFs } from "./virtualFs";

export const STORAGE_KEY = "hyogen-md-playground-v1";

export type PersistedSnapshot = {
  version: 1;
  files: Record<string, string>;
};

export function serialize(fs: VirtualFs): string {
  const snapshot: PersistedSnapshot = {
    version: 1,
    files: fs.dumpFiles(),
  };
  return JSON.stringify(snapshot);
}

export function hydrate(json: string): VirtualFs {
  const parsed = JSON.parse(json) as unknown;
  if (!isValidSnapshot(parsed)) {
    throw new Error("EINVAL: invalid playground snapshot");
  }
  const fs = new VirtualFs();
  fs.loadFiles(parsed.files);
  purgeUnderscoreOutEntries(fs);
  return fs;
}

export function save(fs: VirtualFs, storage: Storage): void {
  // Drop underscore outs and orphans (e.g. /out/components after src rename to _components).
  purgeUnderscoreOutEntries(fs);
  storage.setItem(STORAGE_KEY, serialize(fs));
}

export function loadOrSeed(storage: Storage): VirtualFs {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw == null || raw.length === 0) {
    const fs = resetToDemo(storage);
    purgeUnderscoreOutEntries(fs);
    return fs;
  }
  try {
    const fs = hydrate(raw);
    return fs;
  } catch {
    const fs = resetToDemo(storage);
    purgeUnderscoreOutEntries(fs);
    return fs;
  }
}

export function resetToDemo(storage: Storage): VirtualFs {
  const fs = new VirtualFs();
  applyDemoSeed(fs);
  save(fs, storage);
  return fs;
}

/**
 * Remove invalid `/out` entries:
 * - underscore paths (`/out/_...`)
 * - orphans whose mirrored `/src` path is missing (rename/delete leftovers)
 * - mirrors of underscore `/src` paths (defensive; should not be written)
 */
export function purgeUnderscoreOutEntries(fs: VirtualFs): void {
  const outFiles = Object.keys(fs.dumpFiles()).filter((p) => isOutPath(p));
  // Deepest paths first so parents can be removed afterward.
  outFiles.sort((a, b) => b.length - a.length);
  for (const filePath of outFiles) {
    if (!fs.exists(filePath)) continue;
    if (!shouldPurgeOutFile(fs, filePath)) continue;
    fs.remove(filePath);
    removeEmptyOutAncestors(fs, filePath);
  }
}

function shouldPurgeOutFile(fs: VirtualFs, outPath: string): boolean {
  if (isUnderscoreEntry(outPath)) return true;
  let srcPath: string;
  try {
    srcPath = outToSrc(outPath);
  } catch {
    return true;
  }
  if (!fs.exists(srcPath)) return true;
  if (fs.statKind(srcPath) !== "file") return true;
  return isUnderscoreEntry(srcPath);
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

function isValidSnapshot(value: unknown): value is PersistedSnapshot {
  if (value == null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (v.files == null || typeof v.files !== "object" || Array.isArray(v.files)) {
    return false;
  }
  for (const [k, content] of Object.entries(v.files as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof content !== "string") return false;
  }
  return true;
}
