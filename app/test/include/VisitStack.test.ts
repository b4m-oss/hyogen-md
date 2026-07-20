import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { VisitStack } from "../../src/include/VisitStack.js";

describe("VisitStack", () => {
  it("reports no circular on first visit", () => {
    const stack = new VisitStack();
    assert.deepEqual(stack.check("/a.md"), { circular: false });
  });

  it("allows sequential visits to different files", () => {
    const stack = new VisitStack();
    stack.push("/a.md");
    assert.deepEqual(stack.check("/b.md"), { circular: false });
  });

  it("allows re-visit after pop", () => {
    const stack = new VisitStack();
    stack.push("/a.md");
    stack.pop();
    assert.deepEqual(stack.check("/a.md"), { circular: false });
  });

  it("detects circular include chain", () => {
    const stack = new VisitStack();
    stack.push("/a.md");
    stack.push("/b.md");
    const result = stack.check("/a.md");
    assert.equal(result.circular, true);
    if (result.circular) {
      assert.equal(result.path, "/a.md");
      assert.equal(result.from, "/b.md");
    }
  });

  it("detects self reference", () => {
    const stack = new VisitStack();
    stack.push("/a.md");
    const result = stack.check("/a.md");
    assert.equal(result.circular, true);
  });

  it("treats empty path as non-circular", () => {
    const stack = new VisitStack();
    assert.deepEqual(stack.check(""), { circular: false });
  });
});
