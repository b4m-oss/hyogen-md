import type { HyogenDiagnostic } from "../types.js";

/**
 * Formats a diagnostic as multi-line log text (api.md).
 * Does not write to console — callers decide how to output.
 */
export function formatDiagnosticLog(
  kind: "error" | "warning",
  diagnostic: HyogenDiagnostic,
): string {
  const lines = [`[hyogen:${kind}] ${diagnostic.code}`];

  const details: Record<string, unknown> = {};
  if (diagnostic.details) {
    for (const [key, value] of Object.entries(diagnostic.details)) {
      if (value !== undefined) {
        details[key] = value;
      }
    }
  }

  // details.path takes priority; otherwise include diagnostic.path.
  if (details.path === undefined && diagnostic.path !== undefined) {
    details.path = diagnostic.path;
  }

  for (const [key, value] of Object.entries(details)) {
    lines.push(`  ${key}: ${String(value)}`);
  }

  return lines.join("\n");
}
