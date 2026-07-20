import { createHyogenError } from "../errors/createError.js";
import { mergeContext } from "../context/mergeContext.js";
import { parseFrontMatter } from "../frontmatter/parseFrontMatter.js";
import type { ComponentRegistry } from "./ComponentRegistry.js";
import { parsePropsContract } from "./parsePropsContract.js";
import { validateProps } from "./validateProps.js";
import { isRemotePath } from "../io/isRemotePath.js";
import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";
import { renderDocumentBody } from "../pipeline/renderDocument.js";
import type { HyogenContext, HyogenWarning, Loader } from "../types.js";
import type { VisitStack } from "../include/VisitStack.js";

export type RenderComponentOptions = {
  alias: string;
  props: Record<string, unknown>;
  parentContext: HyogenContext;
  registry: ComponentRegistry;
  loader: Loader;
  rootDir?: string;
  path?: string;
  warnings: HyogenWarning[];
  visitStack: VisitStack;
  preserveHgComments?: boolean;
  constrainToRoot?: boolean;
};

export async function renderComponent(
  options: RenderComponentOptions,
): Promise<string> {
  const registration = options.registry.get(options.alias);
  if (!registration) {
    throw createHyogenError({
      code: "parse_error",
      path: options.path,
      details: {
        message: `unregistered component: ${options.alias}`,
      },
    });
  }

  const componentPath = isRemotePath(registration.componentPath)
    ? registration.componentPath
    : resolveTemplatePath(registration.componentPath, {
        rootDir: options.rootDir,
        fromPath: registration.definedAt,
        documentPath: options.path,
        constrainToRoot: options.constrainToRoot,
        hyogenPath: true,
      });

  const source = await options.loader(componentPath);
  const { context: fmContext, body } = parseFrontMatter(source, componentPath);
  const contract = parsePropsContract(fmContext, componentPath);
  const { values, warnings: propWarnings } = validateProps(
    options.props,
    contract,
    options.alias,
  );
  options.warnings.push(...propWarnings);

  const { props: _props, ...fmWithoutProps } = fmContext;
  const context = mergeContext(
    options.parentContext,
    fmWithoutProps,
    values,
  );

  const markdown = await renderDocumentBody(body, {
    context,
    loader: options.loader,
    root: options.rootDir,
    path: componentPath,
    registry: options.registry,
    warnings: options.warnings,
    visitStack: options.visitStack,
    inComponent: true,
    preserveFrontMatter: false,
    preserveHgComments: options.preserveHgComments,
    constrainToRoot: options.constrainToRoot,
  });

  const output = markdown.trim();
  if (output.includes("\n")) {
    throw createHyogenError({
      code: "component_multiline_output",
      path: componentPath,
      details: { alias: options.alias },
    });
  }

  return output;
}
