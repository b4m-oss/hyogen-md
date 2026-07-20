import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHyogenError } from "../../src/errors/createError.js";

describe("createHyogenError", () => {
  it("builds parse_error with formatted message", () => {
    const error = createHyogenError({
      code: "parse_error",
      path: "page.md",
      details: { message: "unexpected token" },
    });
    assert.equal(error.code, "parse_error");
    assert.match(error.message, /unexpected token/);
    assert.equal(error.path, "page.md");
  });

  it("uses explicit message when provided", () => {
    const error = createHyogenError({
      code: "parse_error",
      message: "custom message",
      details: { message: "ignored" },
    });
    assert.equal(error.message, "custom message");
  });

  it("is instanceof Error", () => {
    const error = createHyogenError({ code: "parse_error" });
    assert.ok(error instanceof Error);
  });

  it("keeps empty code when code is empty string", () => {
    const error = createHyogenError({ code: "" });
    assert.equal(error.code, "");
  });

  it("does not throw when details contain circular references", () => {
    const details: Record<string, unknown> = {};
    details.self = details;
    assert.doesNotThrow(() =>
      createHyogenError({
        code: "parse_error",
        details: { message: "ok" },
      }),
    );
  });

  it("returns empty message for unknown code without explicit message", () => {
    const error = createHyogenError({ code: "totally_unknown" });
    assert.equal(error.message, "");
  });
});
