import { describe, expect, it } from "vitest";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";
import { srcToOut } from "../../../components/playground/fs/paths";

describe("VirtualFs", () => {
  it("creates, reads, and updates files under /src", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/hello.md", "# hi");
    expect(fs.read("/src/hello.md")).toBe("# hi");
    fs.writeSrc("/src/hello.md", "# hello");
    expect(fs.read("/src/hello.md")).toBe("# hello");
  });

  it("creates nested directories", () => {
    const fs = new VirtualFs();
    fs.mkdir("/src/pages");
    fs.mkdir("/src/pages/blog");
    fs.writeSrc("/src/pages/blog/post.md", "post");
    expect(fs.read("/src/pages/blog/post.md")).toBe("post");
  });

  it("writeSrc auto-creates parent directories", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/a/b/c.md", "nested");
    expect(fs.read("/src/a/b/c.md")).toBe("nested");
  });

  it("writeOut writes only under /out", () => {
    const fs = new VirtualFs();
    fs.writeOut("/out/index.md", "rendered");
    expect(fs.read("/out/index.md")).toBe("rendered");
    expect(() => fs.writeOut("/src/index.md", "x")).toThrow(
      /writeOut.*\/out/,
    );
    expect(() => fs.writeSrc("/out/index.md", "x")).toThrow(
      /writeSrc.*\/src/,
    );
  });

  it("renames files and directories", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/old.md", "body");
    fs.rename("/src/old.md", "/src/new.md");
    expect(fs.read("/src/new.md")).toBe("body");
    expect(() => fs.read("/src/old.md")).toThrow(/ENOENT/);

    fs.mkdir("/src/dir");
    fs.writeSrc("/src/dir/a.md", "a");
    fs.rename("/src/dir", "/src/renamed");
    expect(fs.read("/src/renamed/a.md")).toBe("a");
    expect(() => fs.read("/src/dir/a.md")).toThrow(/ENOENT/);
  });

  it("removes files and empty directories", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/gone.md", "x");
    fs.remove("/src/gone.md");
    expect(() => fs.read("/src/gone.md")).toThrow(/ENOENT/);

    fs.mkdir("/src/empty");
    fs.remove("/src/empty");
    expect(fs.listTree("/src").some((n) => n.name === "empty")).toBe(false);
  });

  it("refuses to remove non-empty directories", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/dir/a.md", "a");
    expect(() => fs.remove("/src/dir")).toThrow(/ENOTEMPTY/);
  });

  it("listTree returns nested structure", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/pages/home.md", "home");
    fs.writeSrc("/src/index.md", "index");
    fs.writeOut("/out/index.md", "out");

    const srcTree = fs.listTree("/src");
    expect(srcTree.map((n) => n.name).sort()).toEqual(["index.md", "pages"]);
    const pages = srcTree.find((n) => n.name === "pages");
    expect(pages?.type).toBe("directory");
    expect(pages?.children?.map((c) => c.name)).toEqual(["home.md"]);

    const outTree = fs.listTree("/out");
    expect(outTree.map((n) => n.name)).toEqual(["index.md"]);
  });

  it("statKind reports file, directory, or null", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/file.md", "x");
    fs.mkdir("/src/dir");
    expect(fs.statKind("/src/file.md")).toBe("file");
    expect(fs.statKind("/src/dir")).toBe("directory");
    expect(fs.statKind("/src/missing.md")).toBeNull();
  });

  it("throws ENOENT on missing read", () => {
    const fs = new VirtualFs();
    expect(() => fs.read("/src/missing.md")).toThrow(
      "ENOENT: /src/missing.md",
    );
  });

  it("throws when mkdir over a file", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/file.md", "x");
    expect(() => fs.mkdir("/src/file.md")).toThrow(
      "ENOTDIR: cannot mkdir over file: /src/file.md",
    );
  });

  it("maps src path to out path", () => {
    expect(srcToOut("/src/pages/home.md")).toBe("/out/pages/home.md");
  });
});
