import type { Loader } from "@b4moss/hyogen-md/client";
import type { VirtualFs } from "../fs/virtualFs";
import { isSrcPath, normalizePath } from "../fs/paths";

/**
 * Loader for renderClient: reads only `/src` paths from the virtual FS.
 * Missing files throw so hyogen can surface file_not_found.
 */
export function createVirtualLoader(fs: VirtualFs): Loader {
  return async (filePath: string) => {
    const n = normalizePath(filePath);
    if (!isSrcPath(n)) {
      throw new Error(`EINVAL: loader only reads /src paths: ${n}`);
    }
    return fs.read(n);
  };
}
