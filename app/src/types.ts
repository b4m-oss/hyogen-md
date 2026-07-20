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

export type ParseFrontMatterResult = {
  context: HyogenContext;
  body: string;
  rawFrontMatter?: string;
};

export type ExecuteHgBlocksResult = {
  source: string;
  directives: IncludeDirective[];
};

export type ExprNode =
  | { type: "identifier"; name: string }
  | { type: "literal"; value: unknown }
  | { type: "member"; object: ExprNode; property: string }
  | { type: "default"; left: ExprNode; right: ExprNode };
