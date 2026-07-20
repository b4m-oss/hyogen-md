export declare function renderClient(
  input: string | { path: string },
  context?: HyogenContext,
  options?: RenderOptions & { serverContext?: HyogenContext },
): Promise<RenderResult>;

export declare function createHyogenError(options: {
  code: string;
  message?: string;
  path?: string;
  details?: Record<string, unknown>;
}): HyogenError;

export declare function formatMessage(
  code: string,
  details?: Record<string, unknown>,
): string;

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

export type RenderResult = {
  markdown: string;
  warnings: HyogenWarning[];
};

export {};
