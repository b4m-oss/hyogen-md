import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  FRONTMATTER_SIZE_LIMIT,
  parseFrontMatter,
} from "../../src/frontmatter/parseFrontMatter.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseFrontMatter", () => {
  it("parses basic front matter and body", () => {
    const result = parseFrontMatter("---\ntitle: Hello\n---\n# Body");
    assert.deepEqual(result.context, { title: "Hello" });
    assert.equal(result.body, "# Body");
    assert.match(result.rawFrontMatter ?? "", /title: Hello/);
  });

  it("returns full source as body when front matter is absent", () => {
    const source = "# No front matter";
    const result = parseFrontMatter(source);
    assert.deepEqual(result.context, {});
    assert.equal(result.body, source);
    assert.equal(result.rawFrontMatter, undefined);
  });

  it("parses nested YAML objects", () => {
    const result = parseFrontMatter(
      "---\nmeta:\n  id: 1\n  label: test\n---\nBody",
    );
    assert.deepEqual(result.context, { meta: { id: 1, label: "test" } });
  });

  it("throws frontmatter_too_large when YAML exceeds 64KB", () => {
    const yaml = "x: " + "a".repeat(FRONTMATTER_SIZE_LIMIT);
    try {
      parseFrontMatter(`---\n${yaml}\n---\nbody`);
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "frontmatter_too_large");
    }
  });

  it("throws parse_error for empty front matter body", () => {
    try {
      parseFrontMatter("---\n---\nbody");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for invalid YAML", () => {
    try {
      parseFrontMatter("---\n: [invalid\n---\nbody");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
