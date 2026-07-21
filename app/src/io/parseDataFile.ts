import path from "node:path";
import { parse as parseYaml } from "yaml";
import { createHyogenError } from "../errors/createError.js";
import { parseCsvFromString } from "./parseCsvFromString.js";

function dataFileFormat(filePath: string): string {
  return path.extname(filePath).slice(1).toLowerCase();
}

function assertNonEmptySource(source: string, filePath: string): void {
  if (source.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: filePath,
      details: { message: "empty data file" },
    });
  }
}

export async function parseDataFile(
  source: string,
  filePath: string,
): Promise<unknown> {
  assertNonEmptySource(source, filePath);

  const format = dataFileFormat(filePath);

  switch (format) {
    case "json":
      try {
        return JSON.parse(source);
      } catch (error) {
        throw createHyogenError({
          code: "parse_error",
          path: filePath,
          details: {
            message:
              error instanceof Error ? error.message : "invalid JSON",
          },
        });
      }
    case "yaml":
    case "yml":
      try {
        return parseYaml(source);
      } catch (error) {
        throw createHyogenError({
          code: "parse_error",
          path: filePath,
          details: {
            message:
              error instanceof Error ? error.message : "invalid YAML",
          },
        });
      }
    case "csv":
      return parseCsvFromString(source, filePath);
    default:
      throw createHyogenError({
        code: "parse_error",
        path: filePath,
        details: {
          format,
          message: `unsupported data file format: ${format}`,
        },
      });
  }
}
