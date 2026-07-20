import messages from "./messages.en.json" with { type: "json" };

const errorTemplates = messages.errors as Record<string, string>;

/** Unknown codes resolve to empty string (implementation choice for v0.1). */
export function formatMessage(
  code: string,
  details?: Record<string, unknown>,
): string {
  const template = errorTemplates[code];
  if (template === undefined) {
    return "";
  }

  return template.replace(/\{([^}]+)\}/g, (match, key: string) => {
    if (details === undefined || !(key in details)) {
      return match;
    }
    const value = details[key];
    return value === undefined || value === null ? "" : String(value);
  });
}
