import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHyogenError } from "../../src/errors/createError.js";
import { formatMessage } from "../../src/errors/formatMessage.js";

describe("formatMessage integration", () => {
  it("is used by createHyogenError when message is omitted", () => {
    const error = createHyogenError({
      code: "file_not_found",
      details: {
        path: "./x.md",
        from: "./y.md",
        via: "include",
      },
    });
    assert.equal(error.message, formatMessage("file_not_found", error.details));
  });
});
