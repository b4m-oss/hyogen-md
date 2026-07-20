import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { formatMessage } from "../../src/errors/formatMessage.js";

describe("formatMessage", () => {
  it("expands file_not_found template with all placeholders", () => {
    const message = formatMessage("file_not_found", {
      path: "./a.md",
      from: "./b.md",
      via: "include",
    });
    assert.equal(
      message,
      "File not found: ./a.md (referenced from ./b.md via include)",
    );
  });

  it("expands parse_error with a single placeholder", () => {
    const message = formatMessage("parse_error", {
      path: "page.md",
      message: "unexpected token",
    });
    assert.match(message, /unexpected token/);
  });

  it("keeps empty string values as empty expansions", () => {
    const message = formatMessage("parse_error", {
      path: "page.md",
      message: "",
    });
    assert.match(message, /Parse error in page\.md: $/);
  });

  it("returns empty string for unknown code", () => {
    assert.equal(formatMessage("unknown_code_xyz"), "");
  });

  it("leaves unmatched placeholders when details is undefined", () => {
    const message = formatMessage("file_not_found");
    assert.equal(message, "File not found: {path} (referenced from {from} via {via})");
  });

  it("does not throw on malformed placeholder braces", () => {
    assert.doesNotThrow(() => formatMessage("parse_error", { message: "ok" }));
  });
});
