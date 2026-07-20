/** Browser shim — node:fs must not be used on the client entry. */
export function existsSync(_path: string): boolean {
  throw new Error("node:fs is not available in hyogen-md/client");
}

export function statSync(_path: string): never {
  throw new Error("node:fs is not available in hyogen-md/client");
}

export const realpathSync = {
  native(_path: string): string {
    throw new Error("node:fs is not available in hyogen-md/client");
  },
};
