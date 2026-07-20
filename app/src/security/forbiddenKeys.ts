import { createHyogenError } from "../errors/createError.js";

export const FORBIDDEN_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "__defineGetter__",
]);

export function isForbiddenKey(key: string): boolean {
  return FORBIDDEN_KEYS.has(key);
}

export function assertSafeMemberAccess(
  property: string,
  path?: string,
): void {
  if (isForbiddenKey(property)) {
    throw createHyogenError({
      code: "forbidden_property_access",
      path,
      details: { property },
    });
  }
}
