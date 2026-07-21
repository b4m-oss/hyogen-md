import { normalizePath, OUT_ROOT, SRC_ROOT } from "./paths";

/**
 * True when any path segment under `/src` or `/out` starts with `_`
 * (same rule as app `isUnderscorePartial`, after stripping the root prefix).
 */
export function isUnderscoreEntry(path: string): boolean {
  const n = normalizePath(path);
  if (n === SRC_ROOT || n === OUT_ROOT) {
    return false;
  }

  let relative: string;
  if (n.startsWith(`${SRC_ROOT}/`)) {
    relative = n.slice(SRC_ROOT.length + 1);
  } else if (n.startsWith(`${OUT_ROOT}/`)) {
    relative = n.slice(OUT_ROOT.length + 1);
  } else {
    // Outside /src|/out: judge by segments after stripping leading `/`.
    relative = n.startsWith("/") ? n.slice(1) : n;
  }

  if (relative.length === 0) {
    return false;
  }

  const parts = relative.split("/").filter((p) => p.length > 0);
  return parts.some((part) => part.startsWith("_"));
}
