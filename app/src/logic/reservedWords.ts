export const RESERVED_WORDS = new Set([
  "if",
  "else",
  "endif",
  "const",
  "let",
  "for",
  "do",
  "while",
  "each",
  "endeach",
  "block",
  "endblock",
  "extend",
  "include",
  "component",
  "as",
]);

export function isReservedWord(name: string): boolean {
  return RESERVED_WORDS.has(name);
}
