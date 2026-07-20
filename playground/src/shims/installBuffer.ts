/**
 * Provide Node's Buffer for browser bundles.
 * hyogen-md frontmatter parsing uses Buffer.byteLength.
 */
import { Buffer } from "buffer";

const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (typeof g.Buffer === "undefined") {
  g.Buffer = Buffer;
}

export { Buffer };
