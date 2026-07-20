export function applyFrontMatterOutputOption(
  markdown: string,
  options: {
    preserveFrontMatter?: boolean;
    rawFrontMatter?: string;
  },
): string {
  if (!options.preserveFrontMatter || !options.rawFrontMatter) {
    return markdown;
  }

  if (markdown.length === 0) {
    return `${options.rawFrontMatter}\n`;
  }

  return `${options.rawFrontMatter}\n${markdown}`;
}
