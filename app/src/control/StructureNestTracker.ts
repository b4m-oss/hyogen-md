export const STRUCTURE_NEST_LIMIT = 20;

export type NestEnterResult =
  | { exceeded: false; depth: number }
  | { exceeded: true; limit: number };

export class StructureNestTracker {
  private depth = 0;

  get currentDepth(): number {
    return this.depth;
  }

  enter(): NestEnterResult {
    if (this.depth >= STRUCTURE_NEST_LIMIT) {
      return { exceeded: true, limit: STRUCTURE_NEST_LIMIT };
    }
    this.depth++;
    return { exceeded: false, depth: this.depth };
  }

  exit(): void {
    if (this.depth > 0) {
      this.depth--;
    }
  }
}
