import { renderClient } from "hyogen-md/client";
import type { HyogenContext, HyogenWarning } from "hyogen-md/client";
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
 * On failure, leaves previous out content untouched.
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
    fs.writeOut(srcToOut(srcPath), result.markdown);
    return { markdown: result.markdown, warnings: result.warnings };
  } catch (error) {
    return { error };
  }
}
