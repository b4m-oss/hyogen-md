import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";
import { isRemotePath } from "./isRemotePath.js";

export function resolveIncludePath(
  root: string | undefined,
  includePath: string,
  documentPath?: string,
  fromPath?: string,
  constrainToRoot = false,
  hyogenPath = false,
): string {
  if (isRemotePath(includePath)) {
    return includePath;
  }
  return resolveTemplatePath(includePath, {
    rootDir: root,
    fromPath,
    documentPath,
    constrainToRoot,
    hyogenPath,
  });
}
