import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { ComponentRegistry } from "../../src/component/ComponentRegistry.js";
import { parseComponentDirective } from "../../src/parse/parseComponentDirective.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseComponentDirective", () => {
  it("parses component path and alias", () => {
    const result = parseComponentDirective(
      "component ./components/greeting.md as greet",
    );
    assert.deepEqual(result, {
      kind: "component",
      path: "./components/greeting.md",
      alias: "greet",
    });
  });

  it("accepts root-relative path", () => {
    const result = parseComponentDirective(
      "component /components/greeting.md as greet",
    );
    assert.equal(result.path, "/components/greeting.md");
  });

  it("trims surrounding whitespace", () => {
    const result = parseComponentDirective(
      "  component ./a.md as greet  ",
    );
    assert.equal(result.alias, "greet");
  });

  it("throws parse_error when as is missing", () => {
    try {
      parseComponentDirective("component ./a.md");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for invalid alias", () => {
    try {
      parseComponentDirective("component ./a.md as 1bad");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error when include coexists", () => {
    try {
      parseComponentDirective("include ./a.md component ./b.md as x");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("ComponentRegistry", () => {
  it("registers and retrieves aliases", () => {
    const registry = new ComponentRegistry();
    registry.register(
      { alias: "greet", componentPath: "./greeting.md", definedAt: "/a.md" },
      [],
    );
    assert.equal(registry.get("greet")?.alias, "greet");
  });

  it("throws duplicate_component_alias for same alias twice", () => {
    const registry = new ComponentRegistry();
    registry.register(
      { alias: "greet", componentPath: "./a.md", definedAt: "/page.md" },
      [],
    );
    try {
      registry.register(
        { alias: "greet", componentPath: "./b.md", definedAt: "/page.md" },
        [],
      );
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "duplicate_component_alias");
    }
  });

  it("throws alias_collision with context keys", () => {
    const registry = new ComponentRegistry();
    try {
      registry.register(
        { alias: "title", componentPath: "./a.md", definedAt: "/page.md" },
        ["title"],
      );
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "alias_collision");
    }
  });

  it("returns undefined for unknown alias", () => {
    const registry = new ComponentRegistry();
    assert.equal(registry.get("missing"), undefined);
  });
});
