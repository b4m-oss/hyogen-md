import { formatWarningMessage } from "../errors/formatMessage.js";
import messages from "../errors/messages.en.json" with { type: "json" };
import type { HyogenContext, HyogenWarning } from "../types.js";

const warningReasons = messages.warningReasons as Record<string, string>;

type SuspiciousReason =
  | "contains_html_script_tag"
  | "contains_event_handler"
  | "contains_dangerous_scheme"
  | "contains_embed_tag"
  | "contains_meta_refresh";

const CHECKS: Array<{ reason: SuspiciousReason; test: (value: string) => boolean }> = [
  {
    reason: "contains_html_script_tag",
    test: (value) => /<\/?script\b/i.test(value),
  },
  {
    reason: "contains_event_handler",
    test: (value) => /\bon(?:error|click|load)\s*=/i.test(value),
  },
  {
    reason: "contains_dangerous_scheme",
    test: (value) => /(?:javascript|vbscript)\s*:/i.test(value),
  },
  {
    reason: "contains_embed_tag",
    test: (value) => /<(?:iframe|object|embed)\b/i.test(value),
  },
  {
    reason: "contains_meta_refresh",
    test: (value) => /<meta\b[^>]*\bhttp-equiv\b/i.test(value),
  },
];

function reasonText(reason: SuspiciousReason): string {
  return warningReasons[reason] ?? reason;
}

function scanValue(
  value: unknown,
  keyPath: string,
  warnings: HyogenWarning[],
  path?: string,
): void {
  if (typeof value === "string") {
    for (const check of CHECKS) {
      if (check.test(value)) {
        warnings.push({
          code: "suspicious_context_value",
          message: formatWarningMessage("suspicious_context_value", {
            key: keyPath,
            reason: reasonText(check.reason),
          }),
          path,
          details: { key: keyPath, reason: check.reason },
        });
        // One warning per reason match is enough; continue other reasons.
      }
    }
    return;
  }

  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      scanValue(value[i], `${keyPath}[${i}]`, warnings, path);
    }
    return;
  }

  if (typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const nextPath = keyPath.length > 0 ? `${keyPath}.${childKey}` : childKey;
      scanValue(childValue, nextPath, warnings, path);
    }
  }
}

/**
 * Recursively scans context string leaves for suspicious patterns.
 * Does not mutate context values; only appends warnings.
 */
export function scanSuspiciousContext(
  context: HyogenContext,
  warnings: HyogenWarning[],
  path?: string,
): void {
  for (const [key, value] of Object.entries(context)) {
    scanValue(value, key, warnings, path);
  }
}
