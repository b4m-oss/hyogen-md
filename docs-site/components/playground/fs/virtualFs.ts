import {
  SRC_ROOT,
  OUT_ROOT,
  basename,
  isOutPath,
  isSrcPath,
  normalizePath,
  parentPath,
} from "./paths";

export type FsFile = { type: "file"; content: string };
export type FsDirectory = { type: "directory" };
export type FsEntry = FsFile | FsDirectory;

export type TreeNode = {
  path: string;
  name: string;
  type: "file" | "directory";
  children?: TreeNode[];
};

export class VirtualFs {
  private readonly entries = new Map<string, FsEntry>();

  constructor() {
    this.entries.set(SRC_ROOT, { type: "directory" });
    this.entries.set(OUT_ROOT, { type: "directory" });
  }

  read(path: string): string {
    const n = normalizePath(path);
    const entry = this.entries.get(n);
    if (!entry) {
      throw new Error(`ENOENT: ${n}`);
    }
    if (entry.type !== "file") {
      throw new Error(`EISDIR: ${n}`);
    }
    return entry.content;
  }

  exists(path: string): boolean {
    return this.entries.has(normalizePath(path));
  }

  statKind(path: string): "file" | "directory" | null {
    const entry = this.entries.get(normalizePath(path));
    return entry?.type ?? null;
  }

  writeSrc(path: string, content: string): void {
    const n = normalizePath(path);
    if (!isSrcPath(n) || n === SRC_ROOT) {
      throw new Error(`EINVAL: writeSrc requires a path under /src: ${path}`);
    }
    this.writeFile(n, content);
  }

  writeOut(path: string, content: string): void {
    const n = normalizePath(path);
    if (!isOutPath(n) || n === OUT_ROOT) {
      throw new Error(`EINVAL: writeOut requires a path under /out: ${path}`);
    }
    this.writeFile(n, content);
  }

  mkdir(path: string): void {
    const n = normalizePath(path);
    if (n === "/" || n === SRC_ROOT || n === OUT_ROOT) {
      return;
    }
    const existing = this.entries.get(n);
    if (existing) {
      if (existing.type === "directory") return;
      throw new Error(`ENOTDIR: cannot mkdir over file: ${n}`);
    }
    this.ensureParentDirs(n);
    const parent = this.entries.get(parentPath(n));
    if (parent && parent.type !== "directory") {
      throw new Error(`ENOTDIR: cannot mkdir over file: ${parentPath(n)}`);
    }
    this.entries.set(n, { type: "directory" });
  }

  rename(from: string, to: string): void {
    const src = normalizePath(from);
    const dest = normalizePath(to);
    if (!this.entries.has(src)) {
      throw new Error(`ENOENT: ${src}`);
    }
    if (this.entries.has(dest)) {
      throw new Error(`EEXIST: ${dest}`);
    }
    if (dest === src || dest.startsWith(`${src}/`)) {
      throw new Error(`EINVAL: cannot rename into itself: ${src} -> ${dest}`);
    }

    this.ensureParentDirs(dest);
    const moving = [...this.entries.entries()].filter(
      ([p]) => p === src || p.startsWith(`${src}/`),
    );
    for (const [p, entry] of moving) {
      const next = p === src ? dest : `${dest}${p.slice(src.length)}`;
      this.entries.set(next, entry);
      this.entries.delete(p);
    }
  }

  remove(path: string): void {
    const n = normalizePath(path);
    if (n === SRC_ROOT || n === OUT_ROOT) {
      throw new Error(`EINVAL: cannot remove root: ${n}`);
    }
    const entry = this.entries.get(n);
    if (!entry) {
      throw new Error(`ENOENT: ${n}`);
    }
    if (entry.type === "directory") {
      const hasChild = [...this.entries.keys()].some((p) =>
        p.startsWith(`${n}/`),
      );
      if (hasChild) {
        throw new Error(`ENOTEMPTY: ${n}`);
      }
    }
    this.entries.delete(n);
  }

  listTree(root: string = SRC_ROOT): TreeNode[] {
    const n = normalizePath(root);
    if (!this.entries.has(n)) {
      throw new Error(`ENOENT: ${n}`);
    }
    return this.childrenOf(n);
  }

  /** Snapshot of all file contents (directories inferred on hydrate). */
  dumpFiles(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [p, entry] of this.entries) {
      if (entry.type === "file") {
        out[p] = entry.content;
      }
    }
    return out;
  }

  /** Replace all content from a file map. Keeps /src and /out roots. */
  loadFiles(files: Record<string, string>): void {
    this.entries.clear();
    this.entries.set(SRC_ROOT, { type: "directory" });
    this.entries.set(OUT_ROOT, { type: "directory" });
    for (const [p, content] of Object.entries(files)) {
      const n = normalizePath(p);
      this.writeFile(n, content);
    }
  }

  private writeFile(n: string, content: string): void {
    const existing = this.entries.get(n);
    if (existing?.type === "directory") {
      throw new Error(`EISDIR: ${n}`);
    }
    this.ensureParentDirs(n);
    this.entries.set(n, { type: "file", content });
  }

  private ensureParentDirs(filePath: string): void {
    const parts = normalizePath(filePath).split("/").filter(Boolean);
    let cur = "";
    for (let i = 0; i < parts.length - 1; i++) {
      cur += `/${parts[i]}`;
      const existing = this.entries.get(cur);
      if (!existing) {
        this.entries.set(cur, { type: "directory" });
      } else if (existing.type !== "directory") {
        throw new Error(`ENOTDIR: cannot mkdir over file: ${cur}`);
      }
    }
  }

  private childrenOf(dir: string): TreeNode[] {
    const prefix = dir === "/" ? "/" : `${dir}/`;
    const names = new Set<string>();
    for (const p of this.entries.keys()) {
      if (!p.startsWith(prefix)) continue;
      const rest = p.slice(prefix.length);
      const name = rest.split("/")[0];
      if (name) names.add(name);
    }
    const nodes: TreeNode[] = [];
    for (const name of [...names].sort()) {
      const childPath = `${prefix}${name}`.replace(/\/+/g, "/");
      const entry = this.entries.get(childPath);
      if (!entry) continue;
      if (entry.type === "directory") {
        nodes.push({
          path: childPath,
          name,
          type: "directory",
          children: this.childrenOf(childPath),
        });
      } else {
        nodes.push({ path: childPath, name, type: "file" });
      }
    }
    return nodes;
  }
}

export { basename, parentPath };
