import { ControlRule, DeepIndex, GetKeys } from "../types";

const getFieldErrors = <T>(
  value: DeepIndex<T, GetKeys<T>>,
  controlRules?: ControlRule<T>,
  fieldValues?: T
) => {
  if (!controlRules) {
    return [];
  }
  const customValidation = controlRules.validate?.(value as never, fieldValues);
  if (customValidation !== undefined) {
    return customValidation;
  }
  const valueLength = (value as unknown)?.toString()?.length || 0;
  const notFilled = controlRules.required && !valueLength;
  const errors = [];
  if (notFilled) {
    errors.push("Field is required!");
  } else {
    if (
      controlRules.maxLength &&
      valueLength > Number(controlRules.maxLength)
    ) {
      errors.push(
        `The field may not be longer than ${controlRules.maxLength} characters!`
      );
    }
    if (
      controlRules.minLength &&
      valueLength < Number(controlRules.minLength)
    ) {
      errors.push(
        `The field may not be shorter than ${controlRules.minLength} characters!`
      );
    }
    if (
      controlRules.pattern &&
      !new RegExp(controlRules.pattern).test(
        (value as unknown)?.toString() as string
      )
    ) {
      errors.push("The field did not match the expected pattern!");
    }
  }
  return errors;
};

export { getFieldErrors };
