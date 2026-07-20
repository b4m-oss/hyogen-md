import { parse as parseYaml } from "yaml";
import { createHyogenError } from "../errors/createError.js";
import type { HyogenContext, ParseFrontMatterResult } from "../types.js";

export const FRONTMATTER_SIZE_LIMIT = 64 * 1024;

export function parseFrontMatter(
  source: string,
  path?: string,
): ParseFrontMatterResult {
  if (!source.startsWith("---")) {
    return { context: {}, body: source };
  }

  const firstLineEnd = source.indexOf("\n");
  if (firstLineEnd === -1) {
    return { context: {}, body: source };
  }

  const closingIndex = source.indexOf("\n---", firstLineEnd);
  if (closingIndex === -1) {
    return { context: {}, body: source };
  }

  const rawFrontMatter = source.slice(firstLineEnd + 1, closingIndex);
  const rawBytes = Buffer.byteLength(rawFrontMatter, "utf8");

  if (rawBytes > FRONTMATTER_SIZE_LIMIT) {
    throw createHyogenError({
      code: "frontmatter_too_large",
      path,
      details: {
        size: rawBytes,
        limit: FRONTMATTER_SIZE_LIMIT,
      },
    });
  }

  if (rawFrontMatter.trim().length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "empty front matter" },
    });
  }

  let context: HyogenContext;
  try {
    const parsed = parseYaml(rawFrontMatter);
    if (parsed === null || parsed === undefined) {
      context = {};
    } else if (typeof parsed === "object" && !Array.isArray(parsed)) {
      context = parsed as HyogenContext;
    } else {
      throw new Error("front matter must be a YAML mapping");
    }
  } catch (cause) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: {
        message:
          cause instanceof Error ? cause.message : "invalid YAML front matter",
      },
    });
  }

  const bodyStart = closingIndex + "\n---".length;
  let body = source.slice(bodyStart);
  if (body.startsWith("\n")) {
    body = body.slice(1);
  } else if (body.startsWith("\r\n")) {
    body = body.slice(2);
  }

  return {
    context,
    body,
    rawFrontMatter: `---\n${rawFrontMatter}\n---`,
  };
}
