import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseControlOpener } from "../../src/control/parseControlOpener.js";
import { parseControlStructures } from "../../src/control/parseControlStructures.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

function hg(line: string): string {
  return `<!--@hg\n${line}\n@endhg-->`;
}

describe("parseControlOpener", () => {
  it("parses if", () => {
    const opener = parseControlOpener(hg("if isNight"));
    assert.equal(opener?.kind, "if");
  });

  it("parses else if", () => {
    const opener = parseControlOpener(hg("else if score >= 60"));
    assert.equal(opener?.kind, "else_if");
  });

  it("parses else", () => {
    assert.equal(parseControlOpener(hg("else"))?.kind, "else");
  });

  it("parses endif", () => {
    assert.equal(parseControlOpener(hg("endif"))?.kind, "endif");
  });

  it("parses each", () => {
    const opener = parseControlOpener(hg("each item in data"));
    assert.equal(opener?.kind, "each");
    if (opener?.kind === "each") assert.equal(opener.item, "item");
  });

  it("parses endeach", () => {
    assert.equal(parseControlOpener(hg("endeach"))?.kind, "endeach");
  });

  it("returns null for include", () => {
    assert.equal(parseControlOpener(hg("include ./a.md")), null);
  });

  it("throws parse_error for if without expression", () => {
    try {
      parseControlOpener(hg("if"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for each without in", () => {
    try {
      parseControlOpener(hg("each item data"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for uppercase IF", () => {
    try {
      parseControlOpener(hg("IF x"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});

describe("parseControlStructures", () => {
  it("parses if endif block", () => {
    const source = `${hg("if true")}Hello${hg("endif")}`;
    const nodes = parseControlStructures(source);
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0]!.kind, "if");
  });

  it("parses else if chain", () => {
    const source = [
      hg("if false"),
      "A",
      hg("else if true"),
      "B",
      hg("else"),
      "C",
      hg("endif"),
    ].join("");
    const nodes = parseControlStructures(source);
    const ifNode = nodes[0];
    assert.equal(ifNode?.kind, "if");
    if (ifNode?.kind === "if") assert.equal(ifNode.branches.length, 3);
  });

  it("parses each endeach block", () => {
    const source = `${hg("each item in data")}- x${hg("endeach")}`;
    const nodes = parseControlStructures(source);
    assert.equal(nodes[0]?.kind, "each");
  });

  it("allows empty body", () => {
    const source = `${hg("if true")}${hg("endif")}`;
    const nodes = parseControlStructures(source);
    assert.equal(nodes[0]?.kind, "if");
  });

  it("throws parse_error for endif without if", () => {
    try {
      parseControlStructures(hg("endif"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unclosed if", () => {
    try {
      parseControlStructures(hg("if true"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for else without if", () => {
    try {
      parseControlStructures(hg("else"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for endeach without each", () => {
    try {
      parseControlStructures(hg("endeach"));
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
