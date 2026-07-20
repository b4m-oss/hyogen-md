import { existsSync, statSync } from "node:fs";
import path from "node:path";

const DOC_ROOT_MARKER = ".doc_root";

export function findDocRoot(startPath: string): string | undefined {
  let dir: string;
  if (existsSync(startPath)) {
    dir = statSync(startPath).isFile()
      ? path.dirname(startPath)
      : path.resolve(startPath);
  } else {
    dir = path.dirname(path.resolve(startPath));
  }

  while (true) {
    const marker = path.join(dir, DOC_ROOT_MARKER);
    if (existsSync(marker)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}
