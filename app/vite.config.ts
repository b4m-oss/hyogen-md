import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [/^node:/, "yaml", "fast-glob", "picomatch", "path-browserify"],
    },
    sourcemap: true,
    minify: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [dts({ rollupTypes: true })],
});
