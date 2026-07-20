/** Strip // line comments and block comments, preserving string/template contents. */
export function stripComments(source: string): string {
  let result = "";
  let i = 0;
  let inString: '"' | "'" | "`" | null = null;

  while (i < source.length) {
    const ch = source[i]!;

    if (inString) {
      result += ch;
      if (ch === "\\" && i + 1 < source.length) {
        result += source[++i]!;
        i++;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      result += ch;
      i++;
      continue;
    }

    if (source.startsWith("//", i)) {
      while (i < source.length && source[i] !== "\n") {
        i++;
      }
      continue;
    }

    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) {
        break;
      }
      i = end + 2;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}
