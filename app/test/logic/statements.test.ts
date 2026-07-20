import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeStatementList } from "../../src/logic/executeStatement.js";
import { parseStatementList } from "../../src/logic/parseStatement.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("statements v0.7", () => {
  it("runs for loop summing 0..2", async () => {
    const statements = parseStatementList(`
      let sum = 0
      for (let i = 0; i < 3; i = i + 1) {
        sum = sum + i
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.sum, 3);
  });

  it("runs do…while", async () => {
    const statements = parseStatementList(`
      let n = 0
      do {
        n = n + 1
      } while (n < 3)
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.n, 3);
  });

  it("supports ++ and compound assign", async () => {
    const statements = parseStatementList(`
      let i = 0
      i++
      ++i
      i += 2
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.i, 4);
  });

  it("supports nested for", async () => {
    const statements = parseStatementList(`
      let total = 0
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          total = total + 1
        }
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.total, 4);
  });

  it("throws parse_error for empty for condition", () => {
    try {
      parseStatementList("for (;;) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for bare while", () => {
    try {
      parseStatementList("while (x) { x = x + 1 }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for-of", () => {
    try {
      parseStatementList("for (x of y) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for-in", () => {
    try {
      parseStatementList("for (x in y) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unclosed brace", () => {
    try {
      parseStatementList("for (let i = 0; i < 1; i++) { i = i + 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
