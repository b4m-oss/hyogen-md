export function extractHgBlockLines(inner: string): string[] {
  const stripped = inner
    .replace(/@hg/g, "")
    .replace(/@endhg/g, "")
    .trim();

  return stripped
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const CONTROL_DIRECTIVE_PATTERN =
  /^(if\s+.+|else\s+if\s+.+|else|endif|each\s+[A-Za-z_$][A-Za-z0-9_$]*\s+in\s+.+|endeach)$/i;

export function isControlDirectiveLine(line: string): boolean {
  return CONTROL_DIRECTIVE_PATTERN.test(line.trim());
}

export function isSingleLineControlBlock(inner: string): boolean {
  const lines = extractHgBlockLines(inner);
  return lines.length === 1 && isControlDirectiveLine(lines[0]!);
}
