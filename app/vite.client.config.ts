import path from "node:path";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "node:path": "path-browserify",
      "node:fs": path.join(rootDir, "src/shims/fs-browser.ts"),
      "node:fs/promises": path.join(rootDir, "src/shims/fs-promises-browser.ts"),
    },
  },
  build: {
    lib: {
      entry: "src/client.ts",
      formats: ["es"],
      fileName: "client",
    },
    rollupOptions: {
      external: ["yaml"],
    },
    sourcemap: true,
    minify: true,
    outDir: "dist",
    emptyOutDir: false,
  },
  plugins: [
    {
      name: "copy-client-dts",
      closeBundle() {
        copyFileSync(
          path.join(rootDir, "types/client.d.ts"),
          path.join(rootDir, "dist/client.d.ts"),
        );
      },
    },
  ],
});