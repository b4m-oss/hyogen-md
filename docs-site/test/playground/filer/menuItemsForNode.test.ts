import { describe, expect, it } from "vitest";
import { menuItemsForNode } from "../../../components/playground/editor/menuItemsForNode";

describe("menuItemsForNode", () => {
  it("src-root (/src) → New file, New folder only", () => {
    expect(menuItemsForNode("src-root", "/src")).toEqual([
      "new-file",
      "new-folder",
    ]);
  });

  it("SRC directory → New file, New folder, Rename, Delete", () => {
    expect(menuItemsForNode("directory", "/src/partials")).toEqual([
      "new-file",
      "new-folder",
      "rename",
      "delete",
    ]);
  });

  it("SRC file → Rename, Delete only", () => {
    expect(menuItemsForNode("file", "/src/index.md")).toEqual([
      "rename",
      "delete",
    ]);
  });

  it("OUT path → empty (no mutate menu)", () => {
    expect(menuItemsForNode("out", "/out")).toEqual([]);
    expect(menuItemsForNode("out", "/out/index.md")).toEqual([]);
    expect(menuItemsForNode("out", "/out/partials")).toEqual([]);
  });

  it("treats /src passed as directory like src-root (no Rename/Delete)", () => {
    expect(menuItemsForNode("directory", "/src")).toEqual([
      "new-file",
      "new-folder",
    ]);
  });

  it("empty path → empty array", () => {
    expect(menuItemsForNode("file", "")).toEqual([]);
    expect(menuItemsForNode("directory", "")).toEqual([]);
    expect(menuItemsForNode("src-root", "")).toEqual([]);
  });
});
