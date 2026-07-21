import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  hydrate,
  loadOrSeed,
  purgeUnderscoreOutEntries,
  resetToDemo,
  save,
  serialize,
} from "../../../components/playground/fs/persist";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";
import { createMemoryStorage } from "../helpers/memoryStorage";

describe("persist", () => {
  it("serialize → save → hydrate restores src and out", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/a.md", "src-a");
    fs.writeOut("/out/a.md", "out-a");

    const storage = createMemoryStorage();
    save(fs, storage);

    expect(storage.getItem(STORAGE_KEY)).toBeTruthy();

    const restored = hydrate(storage.getItem(STORAGE_KEY)!);
    expect(restored.read("/src/a.md")).toBe("src-a");
    expect(restored.read("/out/a.md")).toBe("out-a");
  });

  it("loadOrSeed seeds when storage is empty", () => {
    const storage = createMemoryStorage();
    const fs = loadOrSeed(storage);
    expect(fs.read("/src/index.md")).toContain('const title = "Welcome"');
    expect(fs.read("/src/partials/intro.md")).toContain("hyogen playground");
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it("resetToDemo overwrites FS and storage with seed", () => {
    const storage = createMemoryStorage();
    const fs = loadOrSeed(storage);
    fs.writeSrc("/src/index.md", "dirty");
    save(fs, storage);

    const reset = resetToDemo(storage);
    expect(reset.read("/src/index.md")).toContain('const title = "Welcome"');
    const again = hydrate(storage.getItem(STORAGE_KEY)!);
    expect(again.read("/src/index.md")).toContain('const title = "Welcome"');
  });

  it("falls back to seed when JSON is broken", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, "{not-json");
    const fs = loadOrSeed(storage);
    expect(fs.read("/src/index.md")).toContain('const title = "Welcome"');
  });

  it("falls back to seed when schema is invalid", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, files: "nope" }));
    const fs = loadOrSeed(storage);
    expect(fs.read("/src/index.md")).toContain('const title = "Welcome"');
  });

  it("round-trips via serialize object shape", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/x.md", "x");
    const json = serialize(fs);
    const parsed = JSON.parse(json) as { version: number; files: Record<string, string> };
    expect(parsed.version).toBe(1);
    expect(parsed.files["/src/x.md"]).toBe("x");
  });

  it("hydrate keeps src underscore files but purges /out underscore entries", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/_meta.md", "src-meta");
    fs.writeOut("/out/_meta.md", "out-meta");
    const storage = createMemoryStorage();
    save(fs, storage);

    const restored = hydrate(storage.getItem(STORAGE_KEY)!);
    expect(restored.read("/src/_meta.md")).toBe("src-meta");
    expect(restored.exists("/out/_meta.md")).toBe(false);
  });

  it("purgeUnderscoreOutEntries removes underscore out tree but keeps normal out", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/index.md", "src");
    fs.writeOut("/out/_partials/x.md", "x");
    fs.writeOut("/out/index.md", "ok");
    purgeUnderscoreOutEntries(fs);
    expect(fs.exists("/out/_partials/x.md")).toBe(false);
    expect(fs.read("/out/index.md")).toBe("ok");
  });

  it("purge removes orphan /out left after src rename to underscore", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "`{{ label }}`\n");
    fs.writeOut("/out/components/badge.md", "`hello`\n");
    fs.rename("/src/components", "/src/_components");

    purgeUnderscoreOutEntries(fs);

    expect(fs.exists("/src/_components/badge.md")).toBe(true);
    expect(fs.exists("/out/components/badge.md")).toBe(false);
    expect(fs.exists("/out/components")).toBe(false);
    expect(fs.exists("/out/_components/badge.md")).toBe(false);
  });

  it("save purges rename leftover /out so hydrate never sees stripped underscore paths", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/components/badge.md", "src");
    fs.writeOut("/out/components/badge.md", "out");
    fs.rename("/src/components", "/src/_components");

    const storage = createMemoryStorage();
    save(fs, storage);

    expect(fs.exists("/out/components/badge.md")).toBe(false);

    const restored = hydrate(storage.getItem(STORAGE_KEY)!);
    expect(restored.exists("/src/_components/badge.md")).toBe(true);
    expect(restored.exists("/out/components/badge.md")).toBe(false);
    expect(restored.exists("/out/_components/badge.md")).toBe(false);
  });

  it("hydrate leaves normal snapshots intact", () => {
    const fs = new VirtualFs();
    fs.writeSrc("/src/a.md", "src-a");
    fs.writeOut("/out/a.md", "out-a");
    const storage = createMemoryStorage();
    save(fs, storage);

    const restored = hydrate(storage.getItem(STORAGE_KEY)!);
    expect(restored.read("/src/a.md")).toBe("src-a");
    expect(restored.read("/out/a.md")).toBe("out-a");
  });

  it("loadOrSeed seed fallback has no underscore /out entries", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, "{not-json");
    const fs = loadOrSeed(storage);
    const outFiles = Object.keys(fs.dumpFiles()).filter((p) =>
      p.startsWith("/out/"),
    );
    expect(outFiles.every((p) => !p.includes("/_"))).toBe(true);
  });

  it("loadOrSeed invalid schema fallback has no underscore /out entries", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, files: "nope" }));
    const fs = loadOrSeed(storage);
    const outFiles = Object.keys(fs.dumpFiles()).filter((p) =>
      p.startsWith("/out/"),
    );
    for (const p of outFiles) {
      expect(p.split("/").some((seg) => seg.startsWith("_"))).toBe(false);
    }
  });
});
