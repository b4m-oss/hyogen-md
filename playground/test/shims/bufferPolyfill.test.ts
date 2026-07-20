import { describe, expect, it } from "vitest";
import { Buffer as BufferPolyfill } from "../../src/shims/installBuffer";
import { VirtualFs } from "../../src/fs/virtualFs";
import { FIXED_CONTEXT, applyDemoSeed } from "../../src/seed/demoSeed";
import { renderOpenFile } from "../../src/render/renderOpenFile";

describe("Buffer polyfill (frontmatter path)", () => {
  it("exposes Buffer.byteLength used by parseFrontMatter", () => {
    expect(typeof BufferPolyfill.byteLength).toBe("function");
    expect(BufferPolyfill.byteLength("yaml: true", "utf8")).toBeGreaterThan(0);
    expect(typeof globalThis.Buffer?.byteLength).toBe("function");
  });

  it("renders demo index through YAML component frontmatter into /out/index.md", async () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);

    const result = await renderOpenFile({
      fs,
      srcPath: "/src/index.md",
      context: FIXED_CONTEXT,
    });

    expect("error" in result).toBe(false);
    if ("error" in result) return;

    expect(result.markdown).toContain("Welcome — hyogen playground");
    expect(fs.exists("/out/index.md")).toBe(true);
    expect(fs.read("/out/index.md")).toBe(result.markdown);
    // badge.md frontmatter path exercised Buffer.byteLength
    expect(result.markdown).toMatch(/`extend`|`include`|`component`/);
  });
});
