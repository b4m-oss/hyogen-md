import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { renderClient } from "../src/renderClient.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

describe("renderClient stub (v0.5)", () => {
  it("throws server_context_on_client when serverContext is passed", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, { serverContext: { x: 1 } } as never),
      (error: unknown) => {
        assertHyogenError(error, "server_context_on_client");
        return true;
      },
    );
  });

  it("checks serverContext before not-implemented", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, {
          serverContext: { x: 1 },
        } as never),
      (error: unknown) => {
        assertHyogenError(error, "server_context_on_client");
        return true;
      },
    );
  });

  it("throws parse_error not-implemented when serverContext is absent", async () => {
    await assert.rejects(
      () => renderClient("# Hi", {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error when serverContext is undefined", async () => {
    await assert.rejects(
      () =>
        renderClient("# Hi", {}, {
          serverContext: undefined,
        } as never),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
