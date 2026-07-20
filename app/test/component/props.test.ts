import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parsePropsContract } from "../../src/component/parsePropsContract.js";
import { validateProps } from "../../src/component/validateProps.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parsePropsContract", () => {
  it("parses formal props contract", () => {
    const contract = parsePropsContract({
      props: {
        name: { type: "string", isRequired: true },
      },
    });
    assert.deepEqual(contract.name, {
      type: "string",
      isRequired: true,
    });
  });

  it("returns empty contract when props section is missing", () => {
    assert.deepEqual(parsePropsContract({}), {});
  });

  it("throws parse_error when props is an array", () => {
    try {
      parsePropsContract({ props: [] });
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("validateProps", () => {
  it("passes matching props through", () => {
    const result = validateProps(
      { name: "Ada", count: 1 },
      {
        name: { type: "string", isRequired: true },
        count: { type: "number" },
      },
      "greet",
    );
    assert.deepEqual(result.values, { name: "Ada", count: 1 });
    assert.equal(result.warnings.length, 0);
  });

  it("applies defaults for unspecified props", () => {
    const result = validateProps(
      {},
      { count: { type: "number", default: 3 } },
      "greet",
    );
    assert.equal(result.values.count, 3);
  });

  it("warns on type mismatch and sets undefined", () => {
    const result = validateProps(
      { count: "bad" },
      { count: { type: "number" } },
      "greet",
    );
    assert.equal(result.values.count, undefined);
    assert.equal(result.warnings[0]?.code, "prop_type_mismatch");
  });

  it("warns on missing required prop", () => {
    const result = validateProps(
      {},
      { name: { type: "string", isRequired: true } },
      "greet",
    );
    assert.equal(result.values.name, undefined);
    assert.equal(result.warnings[0]?.code, "prop_missing");
  });

  it("warns on unknown prop and ignores it", () => {
    const result = validateProps(
      { name: "Ada", extra: "x" },
      { name: { type: "string" } },
      "greet",
    );
    assert.equal(result.values.extra, undefined);
    assert.equal(result.warnings[0]?.code, "prop_unknown");
  });

  it("allows arbitrary props with empty contract", () => {
    const result = validateProps({ foo: "bar" }, {}, "greet");
    assert.deepEqual(result.values, { foo: "bar" });
    assert.equal(result.warnings.length, 0);
  });
});
