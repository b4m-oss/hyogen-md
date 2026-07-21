/** Counts trailing `\n` characters. */
export function countTrailingNewlines(text: string): number {
  let count = 0;
  for (let i = text.length - 1; i >= 0 && text[i] === "\n"; i--) {
    count++;
  }
  return count;
}

/** Counts leading `\n` characters. */
export function countLeadingNewlines(text: string): number {
  let count = 0;
  while (count < text.length && text[count] === "\n") {
    count++;
  }
  return count;
}

/**
 * Joins `left` and `right` after a removed directive span.
 * Keeps max(trailing left newlines, leading right newlines) so removal does
 * not invent an extra blank line, while author blank lines are preserved.
 */
export function joinRemovalSeam(left: string, right: string): string {
  const leftNewlines = countTrailingNewlines(left);
  const rightNewlines = countLeadingNewlines(right);
  const keepNewlines = Math.max(leftNewlines, rightNewlines);
  return (
    left.slice(0, left.length - leftNewlines) +
    "\n".repeat(keepNewlines) +
    right.slice(rightNewlines)
  );
}

/** Newline characters dropped by {@link joinRemovalSeam} (for offset tracking). */
export function removalSeamNewlineDelta(left: string, right: string): number {
  const leftNewlines = countTrailingNewlines(left);
  const rightNewlines = countLeadingNewlines(right);
  return leftNewlines + rightNewlines - Math.max(leftNewlines, rightNewlines);
}
