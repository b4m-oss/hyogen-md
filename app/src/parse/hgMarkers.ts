export type HgMarkerKind = "hg" | "at-at" | "mixed" | "unclosed" | "none";

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let pos = 0;
  while (pos < haystack.length) {
    const found = haystack.indexOf(needle, pos);
    if (found === -1) {
      break;
    }
    count++;
    pos = found + needle.length;
  }
  return count;
}

/** Classifies hyogen marker usage inside an HTML comment body. */
export function classifyHgMarkers(inner: string): HgMarkerKind {
  const hasHg = inner.includes("@hg");
  const hasEndHg = inner.includes("@endhg");
  const atAtCount = countOccurrences(inner, "@@");

  if (hasHg && hasEndHg) {
    if (atAtCount > 0) {
      return "mixed";
    }
    return "hg";
  }

  if (atAtCount >= 2 && !hasHg && !hasEndHg) {
    return "at-at";
  }

  if ((hasHg || hasEndHg) && atAtCount > 0) {
    return "mixed";
  }

  if (hasHg && !hasEndHg) {
    return "unclosed";
  }

  if (atAtCount === 1 && !hasEndHg) {
    return "unclosed";
  }

  return "none";
}

/** Strips @hg/@endhg/@@ markers from a hyogen comment inner body. */
export function stripHgMarkers(inner: string): string {
  return inner.replace(/@endhg/g, "").replace(/@hg/g, "").replace(/@@/g, "");
}
