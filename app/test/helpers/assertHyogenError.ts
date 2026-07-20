import assert from "node:assert/strict";
import type { HyogenError } from "../../src/types.js";

export function assertHyogenError(
  error: unknown,
  code: string,
): asserts error is HyogenError {
  assert.ok(error instanceof Error);
  assert.equal((error as HyogenError).code, code);
}
