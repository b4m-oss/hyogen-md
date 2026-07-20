import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseDeclaration, parseDeclarationStatements } from "../../src/logic/parseDeclaration.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseDeclaration", () => {
  it("parses const declaration", () => {
    const decl = parseDeclaration('const text = "foo bar"');
    assert.equal(decl.kind, "const");
    if (decl.kind === "const") assert.equal(decl.name, "text");
  });

  it("parses let declaration", () => {
    const decl = parseDeclaration('let fooBar = "over-writable"');
    assert.equal(decl.kind, "let");
  });

  it("parses reassignment", () => {
    const decl = parseDeclaration('fooBar = "updated"');
    assert.equal(decl.kind, "assign");
  });

  it("parses array literal", () => {
    const decl = parseDeclaration('const data = ["apple", "banana"]');
    assert.equal(decl.expr.type, "literal");
  });

  it("parses object literal", () => {
    const decl = parseDeclaration('const object = { animal: "duck", state: "sitting" }');
    assert.equal(decl.expr.type, "literal");
  });

  it("accepts trailing semicolon", () => {
    const decl = parseDeclaration('const x = 1;');
    assert.equal(decl.kind, "const");
  });

  it("skips line comments", () => {
    const decl = parseDeclaration('const x = 1 // comment');
    assert.equal(decl.kind, "const");
  });

  it("skips block comments", () => {
    const decl = parseDeclaration('const x = /* inline */ 1');
    assert.equal(decl.kind, "const");
  });

  it("parses multiple statements", () => {
    const decls = parseDeclarationStatements('const a = 1; let b = 2; b = 3');
    assert.equal(decls.length, 3);
  });

  it("parses assignment syntax for later runtime validation", () => {
    const decl = parseDeclaration("x = 1");
    assert.equal(decl.kind, "assign");
  });

  it("throws parse_error for reserved word identifier", () => {
    try {
      parseDeclaration("const if = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for empty statement", () => {
    try {
      parseDeclaration("");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
