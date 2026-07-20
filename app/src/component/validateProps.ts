import { formatWarningMessage } from "../errors/formatMessage.js";
import type { HyogenWarning } from "../types.js";
import {
  inferPropType,
  matchesPropType,
  type PropContract,
} from "./parsePropsContract.js";

export type ValidatePropsResult = {
  values: Record<string, unknown>;
  warnings: HyogenWarning[];
};

function createWarning(
  code: string,
  details: Record<string, unknown>,
): HyogenWarning {
  return {
    code,
    message: formatWarningMessage(code, details),
    details,
  };
}

export function validateProps(
  callProps: Record<string, unknown>,
  contract: Record<string, PropContract>,
  componentAlias: string,
): ValidatePropsResult {
  const warnings: HyogenWarning[] = [];
  const values: Record<string, unknown> = {};
  const contractKeys = new Set(Object.keys(contract));

  for (const [key, spec] of Object.entries(contract)) {
    const hasValue = Object.prototype.hasOwnProperty.call(callProps, key);
    let value = hasValue ? callProps[key] : undefined;

    if (!hasValue) {
      if (spec.default !== undefined) {
        value = spec.default;
      } else if (spec.isRequired) {
        warnings.push(
          createWarning("prop_missing", {
            prop: key,
            component: componentAlias,
          }),
        );
        value = undefined;
      } else {
        value = undefined;
      }
    }

    if (hasValue && value !== undefined && value !== null) {
      const expectedType = spec.type ?? inferPropType(value);
      if (expectedType && !matchesPropType(value, expectedType)) {
        warnings.push(
          createWarning("prop_type_mismatch", {
            prop: key,
            component: componentAlias,
            expected: expectedType,
            actual: typeof value,
          }),
        );
        value = undefined;
      }
    }

    values[key] = value;
  }

  for (const key of Object.keys(callProps)) {
    if (!contractKeys.has(key)) {
      if (Object.keys(contract).length > 0) {
        warnings.push(
          createWarning("prop_unknown", {
            prop: key,
            component: componentAlias,
          }),
        );
      } else {
        values[key] = callProps[key];
      }
    }
  }

  return { values, warnings };
}
