import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));

export const v02FixtureDir = path.join(testDir, "../fixtures/v0.2");
export const docRootFixtureDir = path.join(v02FixtureDir, "doc-root");
export const noDocRootFixtureDir = path.join(v02FixtureDir, "no-doc-root");

export function v02Path(...segments: string[]): string {
  return path.join(v02FixtureDir, ...segments);
}
