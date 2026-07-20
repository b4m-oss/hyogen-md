export type HyogenContext = Record<string, unknown>;

export type HyogenDiagnostic = {
  code: string;
  message: string;
  path?: string;
  details?: Record<string, unknown>;
};

export type HyogenWarning = HyogenDiagnostic;

export type HyogenError = Error & HyogenDiagnostic;

export type Loader = (path: string) => Promise<string>;

export type RenderOptions = {
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
  loader?: Loader;
  root?: string;
  path?: string;
  constrainToRoot?: boolean;
};

export type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext;
};

export type RenderResult = {
  markdown: string;
  warnings: HyogenWarning[];
};

export type HgBlock = {
  start: number;
  end: number;
  inner: string;
  raw: string;
};

export type IncludeDirective = {
  kind: "include";
  path: string;
  marker: string;
  raw?: string;
};

export type ComponentDirective = {
  kind: "component";
  path: string;
  alias: string;
};

export type ParseFrontMatterResult = {
  context: HyogenContext;
  body: string;
  rawFrontMatter?: string;
};

export type ExecuteHgBlocksResult = {
  source: string;
  directives: IncludeDirective[];
};

export type BinaryOp =
  | "+"
  | "-"
  | "*"
  | "/"
  | "==="
  | "!=="
  | "=="
  | "!="
  | ">="
  | "<="
  | ">"
  | "<"
  | "&&"
  | "||";

export type ExprNode =
  | { type: "identifier"; name: string }
  | { type: "literal"; value: unknown }
  | { type: "member"; object: ExprNode; property: string }
  | { type: "default"; left: ExprNode; right: ExprNode }
  | { type: "call"; callee: string; args: Record<string, unknown> }
  | { type: "method"; object: ExprNode; method: string; args: unknown[] }
  | { type: "unary"; op: "!"; operand: ExprNode }
  | { type: "binary"; op: BinaryOp; left: ExprNode; right: ExprNode };

export type Declaration =
  | { kind: "const"; name: string; expr: ExprNode }
  | { kind: "let"; name: string; expr: ExprNode }
  | { kind: "assign"; name: string; expr: ExprNode };

export type ControlOpener =
  | { kind: "if"; expr: ExprNode }
  | { kind: "else_if"; expr: ExprNode }
  | { kind: "else" }
  | { kind: "endif" }
  | { kind: "each"; item: string; expr: ExprNode }
  | { kind: "endeach" };

export type ControlBlockSpan = {
  start: number;
  end: number;
  raw: string;
};

export type IfBranch = {
  kind: "if" | "else_if" | "else";
  expr?: ExprNode;
  opener: ControlBlockSpan;
  body: ControlNode[];
};

export type ControlNode =
  | { kind: "text"; content: string }
  | { kind: "if"; branches: IfBranch[]; closer: ControlBlockSpan }
  | {
      kind: "each";
      item: string;
      expr: ExprNode;
      opener: ControlBlockSpan;
      body: ControlNode[];
      closer: ControlBlockSpan;
    };

export type ExecuteDeclarationsResult = {
  source: string;
  context: HyogenContext;
};

export type EvaluateExpressionOptions = {
  context: HyogenContext;
  path?: string;
  registry?: import("./component/ComponentRegistry.js").ComponentRegistry;
  loader?: Loader;
  rootDir?: string;
  warnings?: HyogenWarning[];
  visitStack?: import("./include/VisitStack.js").VisitStack;
  parentContext?: HyogenContext;
  preserveHgComments?: boolean;
  constrainToRoot?: boolean;
};

export type InterpolateExpressionsOptions = EvaluateExpressionOptions;
