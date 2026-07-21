import { describe, expect, it } from "vitest";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";
import { syncOutAfterSrcRename } from "../../../components/playground/fs/syncOutAfterSrcRename";
import { renderOpenFile } from "../../../components/playground/render/renderOpenFile";
import { renderSrcTreeToOut } from "../../../components/playground/render/renderSrcTreeToOut";
import { FIXED_CONTEXT, applyDemoSeed } from "../../../components/playground/seed/demoSeed";

describe("renderSrcTreeToOut", () => {
  it("renders non-underscore files under a directory into /out", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "`{{ siteName }}`\n");
    fs.writeSrc("/src/components/note.md", "plain note\n");
    fs.writeSrc("/src/components/_skip.md", "partial\n");

    const { paths } = await renderSrcTreeToOut(
      fs,
      "/src/components",
      FIXED_CONTEXT,
    );

    expect(paths.sort()).toEqual([
      "/src/components/badge.md",
      "/src/components/note.md",
    ]);
    expect(fs.exists("/out/components/badge.md")).toBe(true);
    expect(fs.read("/out/components/badge.md")).toContain("hyogen playground");
    expect(fs.read("/out/components/note.md")).toBe("plain note\n");
    expect(fs.exists("/out/components/_skip.md")).toBe(false);
  });

  it("renders a single non-underscore file root", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/meta.md", "# Meta\n");

    await renderSrcTreeToOut(fs, "/src/meta.md", FIXED_CONTEXT);

    expect(fs.exists("/out/meta.md")).toBe(true);
    expect(fs.read("/out/meta.md")).toContain("Meta");
  });

  it("after demo reset, nested /out files reappear via full /src tree render", async () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);

    const { paths } = await renderSrcTreeToOut(fs, "/src", FIXED_CONTEXT);

    expect(paths).toContain("/src/index.md");
    expect(paths).toContain("/src/components/badge.md");
    expect(paths).toContain("/src/partials/intro.md");
    expect(paths).toContain("/src/layouts/base.md");

    expect(fs.exists("/out/index.md")).toBe(true);
    expect(fs.exists("/out/components/badge.md")).toBe(true);
    expect(fs.exists("/out/partials/intro.md")).toBe(true);
    // layout is not a render entry (orphan block) — soft note, no /out write
    expect(fs.exists("/out/layouts/base.md")).toBe(false);

    const outNames = fs.listTree("/out").map((n) => n.name).sort();
    expect(outNames).toEqual(["components", "index.md", "partials"]);
  });

  it("skips underscore file root without writing /out", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "# Meta\n");

    const { paths } = await renderSrcTreeToOut(
      fs,
      "/src/_meta.md",
      FIXED_CONTEXT,
    );

    expect(paths).toEqual([]);
    expect(fs.exists("/out/_meta.md")).toBe(false);
    expect(fs.exists("/out/meta.md")).toBe(false);
  });

  it("skips nested underscore directories", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/widgets/ok.md", "ok\n");
    fs.writeSrc("/src/widgets/_hidden/x.md", "x\n");

    await renderSrcTreeToOut(fs, "/src/widgets", FIXED_CONTEXT);

    expect(fs.exists("/out/widgets/ok.md")).toBe(true);
    expect(fs.exists("/out/widgets/_hidden/x.md")).toBe(false);
  });
});

describe("underscore → normal rename then populate /out", () => {
  it("directory: sync alone leaves no out; tree render populates without select", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_components/badge.md", "`{{ siteName }}`\n");
    fs.writeSrc("/src/_components/inner/card.md", "card body\n");

    fs.rename("/src/_components", "/src/components");
    syncOutAfterSrcRename(fs, "/src/_components", "/src/components");
    expect(fs.exists("/out/components/badge.md")).toBe(false);

    // App would call this after rename (no child select / scheduleRender).
    await renderSrcTreeToOut(fs, "/src/components", FIXED_CONTEXT);

    expect(fs.exists("/out/components/badge.md")).toBe(true);
    expect(fs.read("/out/components/badge.md")).toContain("hyogen playground");
    expect(fs.read("/out/components/inner/card.md")).toBe("card body\n");
  });

  it("file: sync alone leaves no out; renderOpenFile populates without extra select", async () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "# Hello {{ siteName }}\n");

    fs.rename("/src/_meta.md", "/src/meta.md");
    syncOutAfterSrcRename(fs, "/src/_meta.md", "/src/meta.md");
    expect(fs.exists("/out/meta.md")).toBe(false);

    // App scheduleRender → renderOpenFile on dest (already selected after rename).
    const result = await renderOpenFile({
      fs,
      srcPath: "/src/meta.md",
      context: FIXED_CONTEXT,
    });

    expect("error" in result).toBe(false);
    expect(fs.exists("/out/meta.md")).toBe(true);
    expect(fs.read("/out/meta.md")).toContain("hyogen playground");
  });
});
