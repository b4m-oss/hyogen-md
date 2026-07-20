import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";

export function resolveIncludePath(
  root: string | undefined,
  includePath: string,
  documentPath?: string,
  fromPath?: string,
  constrainToRoot = false,
  hyogenPath = false,
): string {
  return resolveTemplatePath(includePath, {
    rootDir: root,
    fromPath,
    documentPath,
    constrainToRoot,
    hyogenPath,
  });
}
