/** Returns true when path is an http(s) URL. */
export function isRemotePath(path: string): boolean {
  return /^https?:\/\//i.test(path);
}
