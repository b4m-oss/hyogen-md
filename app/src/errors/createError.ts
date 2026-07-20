import type { HyogenError } from "../types.js";
import { formatMessage } from "./formatMessage.js";

export function createHyogenError(options: {
  code: string;
  message?: string;
  path?: string;
  details?: Record<string, unknown>;
}): HyogenError {
  const message =
    options.message ?? formatMessage(options.code, options.details);

  const error = new Error(message) as HyogenError;
  error.name = "HyogenError";
  error.code = options.code;
  error.message = message;
  error.path = options.path;
  error.details = options.details;
  return error;
}
