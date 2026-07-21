import { describe, expect, it } from "vitest";
import { renderClient } from "@b4moss/hyogen-md/client";
import { VirtualFs } from "../../../components/playground/fs/virtualFs";
import {
  DEMO_ENTRY,
  FIXED_CONTEXT,
  applyDemoSeed,
} from "../../../components/playground/seed/demoSeed";
import { createVirtualLoader } from "../../../components/playground/render/createVirtualLoader";

describe("demoSeed", () => {
  it("includes entry, include, component, extend/block, if/each", () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);

    const index = fs.read("/src/index.md");
    expect(index).toMatch(/extend\s+\.\/layouts\/base\.md/);
    expect(index).toMatch(/include\s+\.\/partials\/intro\.md/);
    expect(index).toMatch(/component\s+\.\/components\/badge\.md/);
    expect(index).toMatch(/\bif\b/);
    expect(index).toMatch(/\beach\b/);
    expect(fs.exists("/src/layouts/base.md")).toBe(true);
    expect(fs.exists("/src/partials/intro.md")).toBe(true);
    expect(fs.exists("/src/components/badge.md")).toBe(true);
  });

  it("renders entry successfully via renderClient + loader", async () => {
    const fs = new VirtualFs();
    applyDemoSeed(fs);
    const loader = createVirtualLoader(fs);

    const result = await renderClient(
      { path: DEMO_ENTRY },
      FIXED_CONTEXT,
      { loader },
    );

    expect(result.markdown).toContain("Welcome — hyogen playground");
    expect(result.markdown).toContain("hyogen playground** demo seed");
    expect(result.markdown).toContain("`extend`");
    expect(result.markdown).toContain("region: Kansai");
  });
});
