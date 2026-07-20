import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeDeclaration } from "../../src/logic/executeDeclaration.js";
import { executeDeclarations } from "../../src/logic/executeDeclarations.js";
import { parseDeclaration } from "../../src/logic/parseDeclaration.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("executeDeclarations", () => {
  it("binds const into context", async () => {
    const context: Record<string, unknown> = {};
    await executeDeclaration(parseDeclaration('const x = "foo"'), context);
    assert.equal(context.x, "foo");
  });

  it("allows let reassignment", async () => {
    const context: Record<string, unknown> = {};
    await executeDeclaration(parseDeclaration('let x = "a"'), context);
    await executeDeclaration(parseDeclaration('x = "b"'), context);
    assert.equal(context.x, "b");
  });

  it("executes multiple statements in order", async () => {
    const context: Record<string, unknown> = {};
    await executeDeclaration(parseDeclaration('let x = 1'), context);
    await executeDeclaration(parseDeclaration("x = 2"), context);
    assert.equal(context.x, 2);
  });

  it("removes declaration blocks from source", async () => {
    const source = "A\n<!--@hg\nconst x = 1\n@endhg-->\nB";
    const { source: result, context } = await executeDeclarations(source);
    assert.equal(result, "A\n\nB");
    assert.equal(context.x, 1);
  });

  it("processes blocks in document order", async () => {
    const source = [
      "<!--@hg\nconst a = 1\n@endhg-->",
      "<!--@hg\nconst b = 2\n@endhg-->",
    ].join("");
    const { context } = await executeDeclarations(source);
    assert.deepEqual(context, { a: 1, b: 2 });
  });

  it("overwrites front matter context values", async () => {
    const source = "<!--@hg\nconst title = \"new\"\n@endhg-->";
    const { context } = await executeDeclarations(source, {
      context: { title: "old" },
    });
    assert.equal(context.title, "new");
  });

  it("throws parse_error for const reassignment", async () => {
    const context: Record<string, unknown> = {};
    const constBindings = new Set(["x"]);
    context.x = 1;
    await assert.rejects(
      () =>
        executeDeclaration(parseDeclaration("x = 2"), context, {
          constBindings,
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for undeclared assignment", async () => {
    await assert.rejects(
      () =>
        executeDeclaration(parseDeclaration("x = 1"), {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for unclosed block", async () => {
    await assert.rejects(
      () => executeDeclarations("<!--@hg\nconst x = 1\n-->"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
