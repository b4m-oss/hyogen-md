import { renderClient } from "hyogen-md/client";
import type { HyogenContext, HyogenWarning } from "hyogen-md/client";
import { isUnderscoreEntry } from "../fs/isUnderscoreEntry";
import { purgeUnderscoreOutEntries } from "../fs/persist";
import type { VirtualFs } from "../fs/virtualFs";
import { isSrcPath, srcToOut } from "../fs/paths";
import { createVirtualLoader } from "./createVirtualLoader";

export type RenderOpenSuccess = {
  markdown: string;
  warnings: HyogenWarning[];
};

export type RenderOpenFailure = {
  error: unknown;
};

export type RenderOpenResult = RenderOpenSuccess | RenderOpenFailure;

export type RenderOpenFileOptions = {
  fs: VirtualFs;
  srcPath: string;
  context?: HyogenContext;
};

/**
 * Render the open src file into the mirrored /out path.
 * Underscore entries are rendered for preview but not written to /out
 * (stale out is removed on success). On failure, leaves previous out untouched.
 */
export async function renderOpenFile(
  options: RenderOpenFileOptions,
): Promise<RenderOpenResult> {
  const { fs, context = {} } = options;
  const srcPath = options.srcPath;
  if (!isSrcPath(srcPath)) {
    return { error: new Error(`EINVAL: not a src path: ${srcPath}`) };
  }

  const loader = createVirtualLoader(fs);
  try {
    const result = await renderClient({ path: srcPath }, context, { loader });
    const outPath = srcToOut(srcPath);
    if (isUnderscoreEntry(srcPath)) {
      if (fs.exists(outPath)) {
        fs.remove(outPath);
      }
      // Also drop rename leftovers like /out/components after src → /src/_components.
      purgeUnderscoreOutEntries(fs);
    } else {
      fs.writeOut(outPath, result.markdown);
    }
    return { markdown: result.markdown, warnings: result.warnings };
  } catch (error) {
    return { error };
  }
}
