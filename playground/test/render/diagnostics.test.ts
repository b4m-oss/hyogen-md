import { describe, expect, it } from "vitest";
import { createHyogenError } from "hyogen-md/client";
import {
  isSoftRenderError,
  toDiagnosticsView,
} from "../../src/render/toDiagnosticsView";

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
      note: null,
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
    expect(view.note).toBeNull();
  });

  it("maps unknown throw as error", () => {
    const view = toDiagnosticsView({ error: new Error("boom") });
    expect(view.ok).toBe(false);
    expect(view.error?.code).toBe("unknown");
    expect(view.error?.message).toBe("boom");
    expect(view.note).toBeNull();
  });

  it("softens orphan block without extend into a note + source markdown", () => {
    const err = createHyogenError({
      code: "parse_error",
      path: "/src/layouts/base.md",
      details: { message: "orphan block without extend" },
    });
    const source = "# layout\n\n<!-- @hg\nblock contents\n@endhg -->\n";
    const view = toDiagnosticsView(
      { error: err },
      { sourceMarkdown: source },
    );
    expect(isSoftRenderError(err)).toBe(true);
    expect(view.ok).toBe(true);
    expect(view.error).toBeNull();
    expect(view.markdown).toBe(source);
    expect(view.note?.code).toBe("not_render_entry");
    expect(view.note?.path).toBe("/src/layouts/base.md");
    expect(view.note?.message).toContain("source Markdown");
    expect(view.note?.message).toContain("orphan block without extend");
  });
});
