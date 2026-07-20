import { createHyogenError } from "../errors/createError.js";
import { stripHgMarkers } from "./hgMarkers.js";

export type ComponentDirective = {
  kind: "component";
  path: string;
  alias: string;
};

const COMPONENT_PATTERN =
  /^component\s+(\S+)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*$/;

export function parseComponentDirective(
  inner: string,
  path?: string,
): ComponentDirective {
  const trimmed = stripHgMarkers(inner).trim();

  if (trimmed.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "empty hyogen block" },
    });
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length !== 1) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: {
        message: "hyogen block must contain a single component directive",
      },
    });
  }

  const line = lines[0]!;
  if (/^include\s+/i.test(line)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "include and component cannot coexist in one block" },
    });
  }

  const match = COMPONENT_PATTERN.exec(line);
  if (!match) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: `unsupported component directive: ${line}` },
    });
  }

  const componentPath = match[1]!;
  if (componentPath.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "empty component path" },
    });
  }

  return {
    kind: "component",
    path: componentPath,
    alias: match[2]!,
  };
}
