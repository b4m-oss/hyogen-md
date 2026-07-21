import type { HyogenWarning } from "@b4moss/hyogen-md/client";
import type { RenderOpenResult } from "./renderOpenFile";

export type DiagnosticsError = {
  code: string;
  message: string;
  path?: string;
};

export type DiagnosticsView = {
  /** Hard render failure only. Soft notes keep `ok: true`. */
  ok: boolean;
  markdown: string | null;
  warnings: HyogenWarning[];
  error: DiagnosticsError | null;
  /** Library parse issues that are expected for non-entry files (layouts, etc.). */
  note: DiagnosticsError | null;
};

export type ToDiagnosticsViewOptions = {
  /** Used as Preview when the failure is classified as a soft note. */
  sourceMarkdown?: string;
};

/** Library errors that Playground softens (not red Diagnostics). */
const SOFT_PARSE_MESSAGES = ["orphan block without extend"] as const;

export function isSoftRenderError(error: unknown): boolean {
  const normalized = normalizeError(error);
  return SOFT_PARSE_MESSAGES.some((m) => normalized.message.includes(m));
}

export function toDiagnosticsView(
  result: RenderOpenResult,
  options: ToDiagnosticsViewOptions = {},
): DiagnosticsView {
  if ("error" in result) {
    const normalized = normalizeError(result.error);
    if (isSoftRenderError(result.error)) {
      return {
        ok: true,
        markdown: options.sourceMarkdown ?? null,
        warnings: [],
        error: null,
        note: {
          code: "not_render_entry",
          message:
            "Not rendered as an entry — preview shows source Markdown. " +
            `(${normalized.message})`,
          path: normalized.path,
        },
      };
    }
    return {
      ok: false,
      markdown: null,
      warnings: [],
      error: normalized,
      note: null,
    };
  }
  return {
    ok: true,
    markdown: result.markdown,
    warnings: result.warnings,
    error: null,
    note: null,
  };
}

function normalizeError(error: unknown): DiagnosticsError {
  if (error && typeof error === "object") {
    const e = error as {
      code?: unknown;
      message?: unknown;
      path?: unknown;
      name?: unknown;
    };
    if (typeof e.message === "string") {
      return {
        code: typeof e.code === "string" ? e.code : "unknown",
        message: e.message,
        path: typeof e.path === "string" ? e.path : undefined,
      };
    }
  }
  return {
    code: "unknown",
    message: String(error),
  };
}
