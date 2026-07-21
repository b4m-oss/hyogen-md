/** Path helpers for playground virtual FS (`/src` ↔ `/out`). */

export const SRC_ROOT = "/src";
export const OUT_ROOT = "/out";

export function normalizePath(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("EINVAL: empty path");
  }
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const parts = withSlash.split("/").filter((p) => p.length > 0 && p !== ".");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      if (stack.length === 0) {
        throw new Error(`EINVAL: path escapes root: ${input}`);
      }
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return `/${stack.join("/")}`;
}

export function parentPath(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf("/");
  if (idx <= 0) return "/";
  return n.slice(0, idx) || "/";
}

export function basename(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf("/");
  return idx < 0 ? n : n.slice(idx + 1);
}

export function isSrcPath(p: string): boolean {
  const n = normalizePath(p);
  return n === SRC_ROOT || n.startsWith(`${SRC_ROOT}/`);
}

export function isOutPath(p: string): boolean {
  const n = normalizePath(p);
  return n === OUT_ROOT || n.startsWith(`${OUT_ROOT}/`);
}

/** `/src/a/b.md` → `/out/a/b.md` */
export function srcToOut(srcPath: string): string {
  const n = normalizePath(srcPath);
  if (!isSrcPath(n)) {
    throw new Error(`EINVAL: not a src path: ${srcPath}`);
  }
  if (n === SRC_ROOT) return OUT_ROOT;
  return `${OUT_ROOT}${n.slice(SRC_ROOT.length)}`;
}

/** `/out/a/b.md` → `/src/a/b.md` */
export function outToSrc(outPath: string): string {
  const n = normalizePath(outPath);
  if (!isOutPath(n)) {
    throw new Error(`EINVAL: not an out path: ${outPath}`);
  }
  if (n === OUT_ROOT) return SRC_ROOT;
  return `${SRC_ROOT}${n.slice(OUT_ROOT.length)}`;
}
