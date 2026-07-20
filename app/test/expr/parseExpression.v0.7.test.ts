import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { evaluateExpression } from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseExpression v0.7 ternary", () => {
  it("parses true ? a : b", () => {
    const node = parseExpression('true ? "a" : "b"');
    assert.equal(node.type, "ternary");
  });

  it("binds || before ternary", () => {
    const node = parseExpression("a || b ? c : d");
    assert.equal(node.type, "ternary");
    if (node.type === "ternary") {
      assert.equal(node.condition.type, "binary");
      if (node.condition.type === "binary") {
        assert.equal(node.condition.op, "||");
      }
    }
  });

  it("binds pipe after ternary", () => {
    const node = parseExpression('x ? y : z | "default"');
    assert.equal(node.type, "default");
    if (node.type === "default") {
      assert.equal(node.left.type, "ternary");
    }
  });

  it("throws parse_error when colon is missing", () => {
    try {
      parseExpression("a ? b");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("evaluateExpression v0.7 ternary", () => {
  it("evaluates true branch", async () => {
    const node = parseExpression('true ? "a" : "b"');
    assert.equal(await evaluateExpression(node, { context: {} }), "a");
  });

  it("evaluates false branch", async () => {
    const node = parseExpression('false ? "a" : "b"');
    assert.equal(await evaluateExpression(node, { context: {} }), "b");
  });

  it("evaluates dsl light-status style ternary", async () => {
    const node = parseExpression('isNight ? "Dark" : "Shine"');
    assert.equal(
      await evaluateExpression(node, { context: { isNight: false } }),
      "Shine",
    );
  });
});

describe("parseExpression v0.7 template literal", () => {
  it("parses template with interpolation", () => {
    const node = parseExpression("`hello ${name}`");
    assert.equal(node.type, "template");
  });

  it("allows toLocaleString inside ${}", () => {
    const node = parseExpression("`${n.toLocaleString('ja-JP')}`");
    assert.equal(node.type, "template");
  });

  it("rejects component calls inside ${}", () => {
    try {
      parseExpression('`${greet({ name: "Ada" })}`');
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unterminated template", () => {
    try {
      parseExpression("`hello ${name}");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("evaluateExpression v0.7 template literal", () => {
  it("concatenates interpolated values", async () => {
    const node = parseExpression("`hello ${name}`");
    assert.equal(
      await evaluateExpression(node, { context: { name: "Ada" } }),
      "hello Ada",
    );
  });

  it("evaluates toLocaleString inside template", async () => {
    const node = parseExpression("`${n.toLocaleString('ja-JP')}`");
    const result = await evaluateExpression(node, {
      context: { n: 12345 },
    });
    assert.equal(result, (12345).toLocaleString("ja-JP"));
  });
});
