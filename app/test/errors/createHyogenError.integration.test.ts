import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHyogenError } from "../../src/errors/createError.js";
import { formatMessage } from "../../src/errors/formatMessage.js";

describe("createHyogenError integration", () => {
  it("formats messages consistently with formatMessage", () => {
    const details = { path: "./a.md", from: "./b.md", via: "include" as const };
    const error = createHyogenError({
      code: "file_not_found",
      details,
    });
    assert.equal(error.message, formatMessage("file_not_found", details));
  });
});
