import { describe, expect, it } from "vitest";
import { isUnderscoreEntry } from "../../src/fs/isUnderscoreEntry";

describe("isUnderscoreEntry", () => {
  it("detects underscore basename under /src", () => {
    expect(isUnderscoreEntry("/src/_meta.md")).toBe(true);
  });

  it("detects underscore directory under /src", () => {
    expect(isUnderscoreEntry("/src/_partials/card.md")).toBe(true);
  });

  it("detects underscore basename nested under /src", () => {
    expect(isUnderscoreEntry("/src/partials/_card.md")).toBe(true);
  });

  it("returns false for normal /src paths", () => {
    expect(isUnderscoreEntry("/src/index.md")).toBe(false);
    expect(isUnderscoreEntry("/src/partials/intro.md")).toBe(false);
  });

  it("applies the same rule under /out", () => {
    expect(isUnderscoreEntry("/out/_meta.md")).toBe(true);
  });

  it("returns false for /src and /out roots", () => {
    expect(isUnderscoreEntry("/src")).toBe(false);
    expect(isUnderscoreEntry("/out")).toBe(false);
  });

  it("throws EINVAL on empty path", () => {
    expect(() => isUnderscoreEntry("")).toThrow(/EINVAL/);
  });

  it("judges non-src/out paths by segment rule after stripping leading slash", () => {
    // `/other/a.md` → segments `other`, `a.md` → false
    expect(isUnderscoreEntry("/other/a.md")).toBe(false);
    expect(isUnderscoreEntry("/other/_a.md")).toBe(true);
  });
});
