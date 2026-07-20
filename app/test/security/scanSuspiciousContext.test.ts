import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { scanSuspiciousContext } from "../../src/security/scanSuspiciousContext.js";
import type { HyogenWarning } from "../../src/types.js";

describe("scanSuspiciousContext", () => {
  it("returns no warnings for safe strings", () => {
    const warnings: HyogenWarning[] = [];
    const context = { title: "Hello", nested: { ok: "world" } };
    scanSuspiciousContext(context, warnings);
    assert.equal(warnings.length, 0);
    assert.deepEqual(context, { title: "Hello", nested: { ok: "world" } });
  });

  it("detects script tags", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext({ html: "<script>alert(1)</script>" }, warnings);
    assert.ok(
      warnings.some(
        (w) =>
          w.code === "suspicious_context_value" &&
          w.details?.reason === "contains_html_script_tag",
      ),
    );
  });

  it("detects event handlers", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext({ html: '<img onclick="x()">' }, warnings);
    assert.ok(
      warnings.some((w) => w.details?.reason === "contains_event_handler"),
    );
  });

  it("detects dangerous schemes", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext({ href: "javascript:alert(1)" }, warnings);
    assert.ok(
      warnings.some((w) => w.details?.reason === "contains_dangerous_scheme"),
    );
  });

  it("detects embed tags", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext({ html: "<iframe src=x>" }, warnings);
    assert.ok(
      warnings.some((w) => w.details?.reason === "contains_embed_tag"),
    );
  });

  it("detects meta refresh", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext(
      { html: '<meta http-equiv="refresh" content="0">' },
      warnings,
    );
    assert.ok(
      warnings.some((w) => w.details?.reason === "contains_meta_refresh"),
    );
  });

  it("scans nested object string leaves", () => {
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext(
      { page: { body: "<script src=x>" } },
      warnings,
    );
    assert.ok(
      warnings.some(
        (w) =>
          w.details?.key === "page.body" &&
          w.details?.reason === "contains_html_script_tag",
      ),
    );
  });

  it("does not mutate context values", () => {
    const context = { html: "<script>x</script>" };
    const warnings: HyogenWarning[] = [];
    scanSuspiciousContext(context, warnings);
    assert.equal(context.html, "<script>x</script>");
  });
});
