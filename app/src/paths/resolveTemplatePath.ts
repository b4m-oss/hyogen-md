import path from "node:path";
import { createHyogenError } from "../errors/createError.js";
import { assertNormalizedPathWithinRoot } from "./assertWithinRootDir.js";

export type ResolveTemplatePathOptions = {
  rootDir?: string;
  fromPath?: string;
  documentPath?: string;
  constrainToRoot?: boolean;
  /** When true, `/` paths are hyogen root-relative (require doc root). */
  hyogenPath?: boolean;
};

export function resolveTemplatePath(
  templatePath: string,
  options: ResolveTemplatePathOptions = {},
): string {
  const { rootDir, fromPath, documentPath, constrainToRoot = false, hyogenPath = false } = options;

  if (templatePath.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: documentPath,
      details: { message: "empty template path" },
    });
  }

  let resolved: string;

  if (templatePath.startsWith("/")) {
    if (rootDir) {
      resolved = path.resolve(rootDir, templatePath.slice(1));
    } else if (hyogenPath) {
      throw createHyogenError({
        code: "parse_error",
        path: documentPath,
        details: { message: "root-relative paths require a doc root" },
      });
    } else if (path.isAbsolute(templatePath)) {
      resolved = path.resolve(templatePath);
    } else {
      throw createHyogenError({
        code: "parse_error",
        path: documentPath,
        details: { message: "root-relative paths require a doc root" },
      });
    }
  } else if (
    templatePath.startsWith("./") ||
    templatePath.startsWith("../")
  ) {
    if (fromPath) {
      resolved = path.resolve(path.dirname(fromPath), templatePath);
    } else if (rootDir) {
      resolved = path.resolve(rootDir, templatePath);
    } else {
      throw createHyogenError({
        code: "parse_error",
        path: documentPath,
        details: { message: "root is required for relative template paths" },
      });
    }
  } else if (path.isAbsolute(templatePath)) {
    resolved = path.resolve(templatePath);
  } else if (rootDir) {
    resolved = path.resolve(rootDir, templatePath);
  } else {
    throw createHyogenError({
      code: "parse_error",
      path: documentPath,
      details: { message: "root is required for relative template paths" },
    });
  }

  if (rootDir && constrainToRoot) {
    assertNormalizedPathWithinRoot(resolved, rootDir, documentPath);
  }

  return resolved;
}
