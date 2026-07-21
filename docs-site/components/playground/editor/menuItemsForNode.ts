export type MenuItemId = "new-file" | "new-folder" | "rename" | "delete";

export type MenuNodeKind = "src-root" | "directory" | "file" | "out";

const SRC_ROOT_ITEMS: readonly MenuItemId[] = ["new-file", "new-folder"];
const DIRECTORY_ITEMS: readonly MenuItemId[] = [
  "new-file",
  "new-folder",
  "rename",
  "delete",
];
const FILE_ITEMS: readonly MenuItemId[] = ["rename", "delete"];

/**
 * Pure helper: which action-menu items to show for a filer node.
 * OUT nodes always return []. Empty path returns [].
 * `/src` treated as directory is normalized to src-root (no rename/delete).
 */
export function menuItemsForNode(
  kind: MenuNodeKind,
  path: string,
): MenuItemId[] {
  if (!path) return [];
  if (kind === "out") return [];

  if (kind === "src-root" || path === "/src") {
    return [...SRC_ROOT_ITEMS];
  }

  if (kind === "directory") {
    return [...DIRECTORY_ITEMS];
  }

  if (kind === "file") {
    return [...FILE_ITEMS];
  }

  return [];
}
