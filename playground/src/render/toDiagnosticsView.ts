import type { HyogenWarning } from "hyogen-md/client";
import type { RenderOpenResult } from "./renderOpenFile";

export type DiagnosticsError = {
  code: string;
  message: string;
  path?: string;
};

export type DiagnosticsView = {
  ok: boolean;
  markdown: string | null;
  warnings: HyogenWarning[];
  error: DiagnosticsError | null;
};

export function toDiagnosticsView(result: RenderOpenResult): DiagnosticsView {
  if ("error" in result) {
    return {
      ok: false,
      markdown: null,
      warnings: [],
      error: normalizeError(result.error),
    };
  }
  return {
    ok: true,
    markdown: result.markdown,
    warnings: result.warnings,
    error: null,
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
