export type CircularIncludeResult =
  | { circular: false }
  | { circular: true; path: string; from: string };

export class VisitStack {
  private readonly stack: string[] = [];

  check(visitPath: string): CircularIncludeResult {
    if (visitPath.length === 0) {
      return { circular: false };
    }
    const index = this.stack.indexOf(visitPath);
    if (index !== -1) {
      return {
        circular: true,
        path: visitPath,
        from: this.stack[this.stack.length - 1] ?? visitPath,
      };
    }
    return { circular: false };
  }

  push(visitPath: string): void {
    this.stack.push(visitPath);
  }

  pop(): void {
    this.stack.pop();
  }
}
