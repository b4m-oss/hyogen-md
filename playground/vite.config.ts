import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import inject from "@rollup/plugin-inject";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appSrc = path.resolve(rootDir, "../app/src");

export default defineConfig({
  plugins: [
    vue(),
    // Inject Buffer import wherever bare Buffer is referenced (e.g. parseFrontMatter).
    inject({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    alias: {
      "@b4moss/hyogen-md/client": path.join(appSrc, "client.ts"),
      "@b4moss/hyogen-md": path.join(appSrc, "index.ts"),
      "node:path": "path-browserify",
      "node:fs": path.join(appSrc, "shims/fs-browser.ts"),
      "node:fs/promises": path.join(appSrc, "shims/fs-promises-browser.ts"),
      buffer: path.resolve(rootDir, "node_modules/buffer/index.js"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    fs: {
      allow: [rootDir, path.resolve(rootDir, "../app")],
    },
  },
  optimizeDeps: {
    include: ["buffer", "yaml", "path-browserify"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
