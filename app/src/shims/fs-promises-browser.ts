/** Browser shim — node:fs/promises must not be used on the client entry. */
export async function readFile(_path: string, _encoding?: string): Promise<string> {
  throw new Error("node:fs/promises is not available in hyogen-md/client");
}

export async function stat(_path: string): Promise<never> {
  throw new Error("node:fs/promises is not available in hyogen-md/client");
}

export async function mkdir(_path: string, _options?: unknown): Promise<void> {
  throw new Error("node:fs/promises is not available in hyogen-md/client");
}

export async function writeFile(_path: string, _data: string): Promise<void> {
  throw new Error("node:fs/promises is not available in hyogen-md/client");
}
