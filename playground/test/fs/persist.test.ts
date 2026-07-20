import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  hydrate,
  loadOrSeed,
  resetToDemo,
  save,
  serialize,
} from "../../src/fs/persist";
import { VirtualFs } from "../../src/fs/virtualFs";
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
});
