import { createHyogenError } from "../errors/createError.js";
import type { HyogenContext } from "../types.js";

export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array";

export type PropContract = {
  type?: PropType;
  isRequired?: boolean;
  default?: unknown;
};

const ALLOWED_TYPES = new Set<string>([
  "string",
  "number",
  "boolean",
  "object",
  "array",
]);

export function parsePropsContract(
  fmContext: HyogenContext,
  path?: string,
): Record<string, PropContract> {
  const props = fmContext.props;
  if (props === undefined) {
    return {};
  }

  if (typeof props !== "object" || props === null || Array.isArray(props)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: "props must be a YAML mapping" },
    });
  }

  const contract: Record<string, PropContract> = {};

  for (const [key, value] of Object.entries(props as Record<string, unknown>)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      contract[key] = {};
      continue;
    }

    const entry = value as Record<string, unknown>;
    const propContract: PropContract = {};

    if ("type" in entry && entry.type !== undefined) {
      const typeValue = String(entry.type);
      if (!ALLOWED_TYPES.has(typeValue)) {
        propContract.type = undefined;
      } else {
        propContract.type = typeValue as PropType;
      }
    }

    if ("isRequired" in entry) {
      propContract.isRequired = Boolean(entry.isRequired);
    }

    if ("default" in entry) {
      propContract.default = entry.default;
    }

    contract[key] = propContract;
  }

  return contract;
}

export function inferPropType(value: unknown): PropType | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return undefined;
}

export function matchesPropType(value: unknown, expected: PropType): boolean {
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  return typeof value === expected;
}
