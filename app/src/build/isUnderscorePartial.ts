/**
 * True when the basename starts with `_`, or any directory segment starts with `_`.
 */
export function isUnderscorePartial(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter((p) => p.length > 0);
  return parts.some((part) => part.startsWith("_"));
}
