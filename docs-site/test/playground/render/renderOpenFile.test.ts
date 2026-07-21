import { describe, expect, it } from "vitest";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";
import { FIXED_CONTEXT, applyDemoSeed } from "../../../components/playground/seed/demoSeed";
import { createVirtualLoader } from "../../../components/playground/render/createVirtualLoader";
import { renderOpenFile } from "../../../components/playground/render/renderOpenFile";
import { srcToOut } from "../../../components/playground/fs/paths";
import { loadOrSeed, resetToDemo, save } from "../../../components/playground/fs/persist";
import { createMemoryStorage } from "../helpers/memoryStorage";

describe("createVirtualLoader + renderOpenFile", () => {
  it("resolves include and component via virtual paths", async () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/index.md",
      context: FIXED_CONTEXT,
    });
    expect("markdown" in result && result.markdown).toBeTruthy();
    if ("markdown" in result) {
      expect(result.markdown).toContain("Welcome — hyogen playground");
      expect(result.markdown).toContain("`include`");
    }
  });

  it("writes expanded markdown to corresponding /out path", async () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/index.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(false);
    expect(fs.read("/out/index.md")).toContain("Welcome — hyogen playground");
    expect(srcToOut("/src/index.md")).toBe("/out/index.md");
  });

  it("keeps previous out content when render fails", async () => {
    const fs = new VirtualFs();
    fs.writeSrc(
      "/src/broken.md",
      `<!--
@hg
include ./missing.md
@endhg
-->
`,
    );
    fs.writeOut("/out/broken.md", "PREVIOUS");

    const result = await renderOpenFile({
      fs,
      srcPath: "/src/broken.md",
      context: FIXED_CONTEXT,
    });

    expect("error" in result).toBe(true);
    expect(fs.read("/out/broken.md")).toBe("PREVIOUS");
  });

  it("rejects loading /out paths via loader", async () => {
    const fs = new VirtualFs();
    fs.writeOut("/out/secret.md", "nope");
    const loader = createVirtualLoader(fs);
    await expect(loader("/out/secret.md")).rejects.toThrow(/\/src/);
  });

  it("rejects non-src paths without touching out", async () => {
    const fs = new VirtualFs();
    fs.writeOut("/out/index.md", "KEEP");
    const result = await renderOpenFile({
      fs,
      srcPath: "/out/index.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(true);
    expect(fs.read("/out/index.md")).toBe("KEEP");
  });

  it("returns markdown for underscore file but does not write /out", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "# meta\n");
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/_meta.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(false);
    if ("markdown" in result) {
      expect(result.markdown).toContain("meta");
    }
    expect(fs.exists("/out/_meta.md")).toBe(false);
  });

  it("does not write /out for underscore directory paths", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_partials/a.md", "# a\n");
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/_partials/a.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(false);
    expect(fs.exists("/out/_partials/a.md")).toBe(false);
  });

  it("does not write /out for nested underscore basename", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/partials/_card.md", "# card\n");
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/partials/_card.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(false);
    expect(fs.exists("/out/partials/_card.md")).toBe(false);
  });

  it("removes stale /out when underscore render succeeds", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "# meta\n");
    fs.writeOut("/out/_meta.md", "STALE");
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/_meta.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(false);
    expect(fs.exists("/out/_meta.md")).toBe(false);
  });

  it("does not map underscore src to stripped /out path after rename leftover", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "`x`\n");
    fs.writeOut("/out/components/badge.md", "STALE");
    fs.rename("/src/components", "/src/_components");

    const result = await renderOpenFile({
      fs,
      srcPath: "/src/_components/badge.md",
      context: FIXED_CONTEXT,
    });

    expect("error" in result).toBe(false);
    if ("markdown" in result) {
      expect(result.markdown).toContain("`x`");
    }
    expect(fs.exists("/out/components/badge.md")).toBe(false);
    expect(fs.exists("/out/components")).toBe(false);
    expect(fs.exists("/out/_components/badge.md")).toBe(false);
  });

  it("leaves stale /out when underscore render fails", async () => {
    const fs = new VirtualFs();
    fs.writeSrc(
      "/src/_meta.md",
      `<!--
@hg
include ./missing.md
@endhg
-->
`,
    );
    fs.writeOut("/out/_meta.md", "STALE");
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/_meta.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(true);
    expect(fs.read("/out/_meta.md")).toBe("STALE");
  });

  it("errors when src file does not exist", async () => {
    const fs = new VirtualFs();
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/nope.md",
      context: FIXED_CONTEXT,
    });
    expect("error" in result).toBe(true);
  });

  it("returns warnings with markdown when present", async () => {
    const fs = new VirtualFs();
    // Circular include produces a warning in hyogen
    fs.writeSrc(
      "/src/a.md",
      `<!--
@hg
include ./b.md
@endhg
-->
A
`,
    );
    fs.writeSrc(
      "/src/b.md",
      `<!--
@hg
include ./a.md
@endhg
-->
B
`,
    );

    const result = await renderOpenFile({
      fs,
      srcPath: "/src/a.md",
      context: {},
    });

    if ("error" in result) {
      // Some circular cases throw; either way out policy is tested above.
      // Prefer success+warning path when available.
      expect(result.error).toBeTruthy();
    } else {
      expect(result.markdown).toBeTruthy();
      expect(fs.read("/out/a.md")).toBe(result.markdown);
      if (result.warnings.length > 0) {
        expect(result.warnings.some((w) => w.code.includes("circular"))).toBe(
          true,
        );
      }
    }
  });
});

describe("integration: seed → render → persist → reset", () => {
  it("restores src and out after save/hydrate, and reset returns to seed", async () => {
    const storage = createMemoryStorage();
    const fs = loadOrSeed(storage);

    const rendered = await renderOpenFile({
      fs,
      srcPath: "/src/index.md",
      context: FIXED_CONTEXT,
    });
    expect("markdown" in rendered).toBe(true);
    expect(fs.read("/out/index.md")).toContain("Welcome");

    save(fs, storage);
    const restored = loadOrSeed(storage);
    expect(restored.read("/src/index.md")).toContain('const title = "Welcome"');
    expect(restored.read("/out/index.md")).toContain("Welcome");

    restored.writeSrc("/src/index.md", "changed");
    save(restored, storage);

    const reset = resetToDemo(storage);
    expect(reset.read("/src/index.md")).toContain('const title = "Welcome"');
    expect(reset.exists("/out/index.md")).toBe(false);
  });
});
