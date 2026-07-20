import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  assertSafeMemberAccess,
  isForbiddenKey,
} from "../../src/security/forbiddenKeys.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("isForbiddenKey", () => {
  it("returns false for normal identifiers", () => {
    assert.equal(isForbiddenKey("title"), false);
    assert.equal(isForbiddenKey("userName"), false);
  });

  it("is case-sensitive", () => {
    assert.equal(isForbiddenKey("__PROTO__"), false);
  });

  it("returns true for forbidden keys", () => {
    assert.equal(isForbiddenKey("__proto__"), true);
    assert.equal(isForbiddenKey("prototype"), true);
    assert.equal(isForbiddenKey("constructor"), true);
    assert.equal(isForbiddenKey("__defineGetter__"), true);
  });
});

describe("assertSafeMemberAccess", () => {
  it("allows safe property names", () => {
    assert.doesNotThrow(() => assertSafeMemberAccess("title"));
  });

  it("throws forbidden_property_access for __proto__", () => {
    try {
      assertSafeMemberAccess("__proto__");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "forbidden_property_access");
    }
  });

  it("throws forbidden_property_access for prototype", () => {
    try {
      assertSafeMemberAccess("prototype");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "forbidden_property_access");
    }
  });
});
