#!/usr/bin/env node
import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "app");

function kb(n) {
  return `${(n / 1024).toFixed(2)} kB`;
}

const jsFiles = ["dist/index.js", "dist/client.js"];
const mapFiles = ["dist/index.js.map", "dist/client.js.map"];

console.log("=== app/dist ===");
let jsTotal = 0;
let mapTotal = 0;
for (const rel of jsFiles) {
  const abs = path.join(app, rel);
  const n = statSync(abs).size;
  jsTotal += n;
  const gz = gzipSync(readFileSync(abs)).length;
  console.log(`  ${rel}: ${kb(n)}  (gzip ${kb(gz)})`);
}
for (const rel of mapFiles) {
  const abs = path.join(app, rel);
  const n = statSync(abs).size;
  mapTotal += n;
  console.log(`  ${rel}: ${kb(n)}`);
}
console.log(`  JS total: ${kb(jsTotal)}`);
console.log(`  map total: ${kb(mapTotal)}`);

const packed = spawnSync("npm", ["pack", "--dry-run"], {
  cwd: app,
  encoding: "utf8",
});
const text = `${packed.stdout ?? ""}\n${packed.stderr ?? ""}`;
const pack = text.match(/package size:\s*(\S+)/)?.[1] ?? "?";
const unpack = text.match(/unpacked size:\s*(\S+)/)?.[1] ?? "?";
console.log("=== npm pack ===");
console.log(`  package (tgz): ${pack} kB`);
console.log(`  unpacked: ${unpack} kB`);
console.log("  includes: LICENSE, README*, dist (JS + .d.ts; .map excluded)");
