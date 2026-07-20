import { VirtualFs } from "./virtualFs";
import { applyDemoSeed } from "../seed/demoSeed";

export const STORAGE_KEY = "hyogen-md-playground-v1";

export type PersistedSnapshot = {
  version: 1;
  files: Record<string, string>;
};

export function serialize(fs: VirtualFs): string {
  const snapshot: PersistedSnapshot = {
    version: 1,
    files: fs.dumpFiles(),
  };
  return JSON.stringify(snapshot);
}

export function hydrate(json: string): VirtualFs {
  const parsed = JSON.parse(json) as unknown;
  if (!isValidSnapshot(parsed)) {
    throw new Error("EINVAL: invalid playground snapshot");
  }
  const fs = new VirtualFs();
  fs.loadFiles(parsed.files);
  return fs;
}

export function save(fs: VirtualFs, storage: Storage): void {
  storage.setItem(STORAGE_KEY, serialize(fs));
}

export function loadOrSeed(storage: Storage): VirtualFs {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw == null || raw.length === 0) {
    return resetToDemo(storage);
  }
  try {
    const fs = hydrate(raw);
    return fs;
  } catch {
    return resetToDemo(storage);
  }
}

export function resetToDemo(storage: Storage): VirtualFs {
  const fs = new VirtualFs();
  applyDemoSeed(fs);
  save(fs, storage);
  return fs;
}

function isValidSnapshot(value: unknown): value is PersistedSnapshot {
  if (value == null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (v.files == null || typeof v.files !== "object" || Array.isArray(v.files)) {
    return false;
  }
  for (const [k, content] of Object.entries(v.files as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof content !== "string") return false;
  }
  return true;
}
