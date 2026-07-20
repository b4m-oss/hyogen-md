import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appSrc = path.resolve(rootDir, "../app/src");

export default defineConfig({
  resolve: {
    alias: {
      "hyogen-md/client": path.join(appSrc, "client.ts"),
      "hyogen-md": path.join(appSrc, "index.ts"),
      "node:path": "path-browserify",
      "node:fs": path.join(appSrc, "shims/fs-browser.ts"),
      "node:fs/promises": path.join(appSrc, "shims/fs-promises-browser.ts"),
      buffer: path.resolve(rootDir, "node_modules/buffer/index.js"),
    },
  },
  define: {
    global: "globalThis",
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
