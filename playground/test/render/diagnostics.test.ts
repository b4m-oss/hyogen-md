import { describe, expect, it } from "vitest";
import { createHyogenError } from "hyogen-md/client";
import { toDiagnosticsView } from "../../src/render/toDiagnosticsView";

describe("toDiagnosticsView", () => {
  it("maps success + warnings", () => {
    const view = toDiagnosticsView({
      markdown: "# ok",
      warnings: [
        {
          code: "circular_include",
          message: "cycle",
        },
      ],
    });
    expect(view).toEqual({
      ok: true,
      markdown: "# ok",
      warnings: [{ code: "circular_include", message: "cycle" }],
      error: null,
    });
  });

  it("maps HyogenError failure without markdown", () => {
    const err = createHyogenError({
      code: "file_not_found",
      details: { path: "/src/missing.md" },
    });
    const view = toDiagnosticsView({ error: err });
    expect(view.ok).toBe(false);
    expect(view.markdown).toBeNull();
    expect(view.warnings).toEqual([]);
    expect(view.error?.code).toBe("file_not_found");
    expect(view.error?.message).toBeTruthy();
  });

  it("maps unknown throw as error", () => {
    const view = toDiagnosticsView({ error: new Error("boom") });
    expect(view.ok).toBe(false);
    expect(view.error?.code).toBe("unknown");
    expect(view.error?.message).toBe("boom");
  });
});
