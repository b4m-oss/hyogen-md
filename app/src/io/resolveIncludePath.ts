import path from "node:path";
import { createHyogenError } from "../errors/createError.js";

export function resolveIncludePath(
  root: string | undefined,
  includePath: string,
  documentPath?: string,
): string {
  if (includePath.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: documentPath,
      details: { message: "empty include path" },
    });
  }

  const isRelative = includePath.startsWith("./") || includePath.startsWith("../");

  if (isRelative) {
    if (!root || root.length === 0) {
      throw createHyogenError({
        code: "parse_error",
        path: documentPath,
        details: { message: "root is required for relative include paths" },
      });
    }
    return path.resolve(root, includePath);
  }

  if (path.isAbsolute(includePath)) {
    return path.resolve(includePath);
  }

  if (!root || root.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: documentPath,
      details: { message: "root is required for relative include paths" },
    });
  }

  return path.resolve(root, includePath);
}
