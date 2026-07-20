import { createHyogenError } from "../errors/createError.js";

export type ComponentRegistration = {
  alias: string;
  componentPath: string;
  definedAt?: string;
};

export class ComponentRegistry {
  private readonly components = new Map<string, ComponentRegistration>();

  register(
    entry: ComponentRegistration,
    contextKeys: string[],
    path?: string,
  ): void {
    if (this.components.has(entry.alias)) {
      throw createHyogenError({
        code: "duplicate_component_alias",
        path: path ?? entry.definedAt,
        details: { alias: entry.alias },
      });
    }

    if (contextKeys.includes(entry.alias)) {
      throw createHyogenError({
        code: "alias_collision",
        path: path ?? entry.definedAt,
        details: { alias: entry.alias },
      });
    }

    this.components.set(entry.alias, entry);
  }

  get(alias: string): ComponentRegistration | undefined {
    return this.components.get(alias);
  }

  has(alias: string): boolean {
    return this.components.has(alias);
  }
}
