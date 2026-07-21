import { describe, expect, it } from "vitest";
import { syncOutAfterSrcRename } from "../../../components/playground/fs/syncOutAfterSrcRename";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";

describe("syncOutAfterSrcRename", () => {
  it("mirrors directory rename to /out without select/render", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "`{{ label }}`\n");
    fs.writeOut("/out/components/badge.md", "`hello`\n");

    fs.rename("/src/components", "/src/widgets");
    syncOutAfterSrcRename(fs, "/src/components", "/src/widgets");

    expect(fs.exists("/out/widgets/badge.md")).toBe(true);
    expect(fs.read("/out/widgets/badge.md")).toBe("`hello`\n");
    expect(fs.exists("/out/components/badge.md")).toBe(false);
    expect(fs.exists("/out/components")).toBe(false);
  });

  it("drops /out when src directory is renamed to underscore", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "src");
    fs.writeOut("/out/components/badge.md", "out");

    fs.rename("/src/components", "/src/_components");
    syncOutAfterSrcRename(fs, "/src/components", "/src/_components");

    expect(fs.exists("/src/_components/badge.md")).toBe(true);
    expect(fs.exists("/out/components/badge.md")).toBe(false);
    expect(fs.exists("/out/components")).toBe(false);
    expect(fs.exists("/out/_components/badge.md")).toBe(false);
  });

  it("mirrors file rename to /out", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/a.md", "src-a");
    fs.writeOut("/out/a.md", "out-a");

    fs.rename("/src/a.md", "/src/b.md");
    syncOutAfterSrcRename(fs, "/src/a.md", "/src/b.md");

    expect(fs.read("/out/b.md")).toBe("out-a");
    expect(fs.exists("/out/a.md")).toBe(false);
  });

  it("does not create out when renaming underscore src to normal name", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "only-src");

    fs.rename("/src/_meta.md", "/src/meta.md");
    syncOutAfterSrcRename(fs, "/src/_meta.md", "/src/meta.md");

    expect(fs.exists("/out/meta.md")).toBe(false);
    expect(fs.exists("/out/_meta.md")).toBe(false);
  });

  it("is a no-op when fromOut does not exist", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/x.md", "x");
    fs.rename("/src/x.md", "/src/y.md");
    expect(() =>
      syncOutAfterSrcRename(fs, "/src/x.md", "/src/y.md"),
    ).not.toThrow();
    expect(fs.exists("/out/y.md")).toBe(false);
  });
});
