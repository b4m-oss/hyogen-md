import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeContext } from "../../src/context/mergeContext.js";

describe("mergeContext", () => {
  it("merges distinct keys", () => {
    assert.deepEqual(mergeContext({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
  });

  it("later values overwrite earlier ones", () => {
    assert.deepEqual(mergeContext({ title: "old" }, { title: "new" }), {
      title: "new",
    });
  });

  it("returns empty object for no arguments", () => {
    assert.deepEqual(mergeContext(), {});
  });

  it("skips null and undefined arguments", () => {
    assert.deepEqual(mergeContext(null, { a: 1 }, undefined), { a: 1 });
  });

  it("shallow-merges nested objects by replacement", () => {
    assert.deepEqual(
      mergeContext({ meta: { x: 1 } }, { meta: { y: 2 } }),
      { meta: { y: 2 } },
    );
  });

  it("replaces arrays instead of merging them", () => {
    assert.deepEqual(mergeContext({ items: [1] }, { items: [2, 3] }), {
      items: [2, 3],
    });
  });
});
