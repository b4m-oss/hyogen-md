import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { formatDiagnosticLog } from "../../src/errors/formatDiagnosticLog.js";
import { formatDiagnosticLog as fromIndex } from "../../src/index.js";
import { formatDiagnosticLog as fromClient } from "../../src/client.js";

describe("formatDiagnosticLog", () => {
  it("matches api.md error example", () => {
    const text = formatDiagnosticLog("error", {
      code: "file_not_found",
      message: "File not found",
      details: {
        path: "./missing.md",
        from: "./page.md",
        via: "include",
      },
    });
    assert.equal(
      text,
      [
        "[hyogen:error] file_not_found",
        "  path: ./missing.md",
        "  from: ./page.md",
        "  via: include",
      ].join("\n"),
    );
  });

  it("formats warning with details", () => {
    const text = formatDiagnosticLog("warning", {
      code: "circular_include",
      message: "Circular include",
      details: {
        path: "./a.md",
        via: "include",
      },
    });
    assert.equal(
      text,
      [
        "[hyogen:warning] circular_include",
        "  path: ./a.md",
        "  via: include",
      ].join("\n"),
    );
  });

  it("emits path from diagnostic.path when details are absent", () => {
    const text = formatDiagnosticLog("error", {
      code: "parse_error",
      message: "Parse error",
      path: "./page.md",
    });
    assert.equal(
      text,
      ["[hyogen:error] parse_error", "  path: ./page.md"].join("\n"),
    );
  });

  it("prefers details.path over diagnostic.path", () => {
    const text = formatDiagnosticLog("error", {
      code: "file_not_found",
      message: "File not found",
      path: "./from-diagnostic.md",
      details: {
        path: "./from-details.md",
        via: "include",
      },
    });
    assert.match(text, /path: \.\/from-details\.md/);
    assert.doesNotMatch(text, /from-diagnostic/);
  });

  it("uses diagnostic.path when details omit path", () => {
    const text = formatDiagnosticLog("warning", {
      code: "prop_missing",
      message: "Missing",
      path: "./comp.md",
      details: {
        prop: "name",
      },
    });
    assert.equal(
      text,
      [
        "[hyogen:warning] prop_missing",
        "  prop: name",
        "  path: ./comp.md",
      ].join("\n"),
    );
  });

  it("returns only the code line when details are empty", () => {
    const text = formatDiagnosticLog("error", {
      code: "parse_error",
      message: "Parse error",
      details: {},
    });
    assert.equal(text, "[hyogen:error] parse_error");
  });

  it("omits undefined detail values", () => {
    const text = formatDiagnosticLog("error", {
      code: "file_not_found",
      message: "File not found",
      details: {
        path: "./a.md",
        from: undefined,
        via: "include",
      },
    });
    assert.equal(
      text,
      [
        "[hyogen:error] file_not_found",
        "  path: ./a.md",
        "  via: include",
      ].join("\n"),
    );
  });

  it("stringifies non-string detail values", () => {
    const text = formatDiagnosticLog("warning", {
      code: "nest_limit_exceeded",
      message: "Too deep",
      details: { depth: 21 },
    });
    assert.equal(
      text,
      ["[hyogen:warning] nest_limit_exceeded", "  depth: 21"].join("\n"),
    );
  });
});

describe("formatDiagnosticLog public exports", () => {
  it("is exported from hyogen-md index", () => {
    assert.equal(typeof fromIndex, "function");
    assert.equal(
      fromIndex("error", { code: "parse_error", message: "x" }),
      "[hyogen:error] parse_error",
    );
  });

  it("is exported from hyogen-md/client", () => {
    assert.equal(typeof fromClient, "function");
    assert.equal(
      fromClient("warning", { code: "circular_include", message: "x" }),
      "[hyogen:warning] circular_include",
    );
  });
});
