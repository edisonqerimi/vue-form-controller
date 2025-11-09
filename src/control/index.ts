import { cloneDeep } from "lodash";
import {
  ControlRules,
  CreateControl,
  FieldError,
  ValidationMode,
} from "../types";

const createControl = <T>(
  defaultValues?: Partial<Record<keyof T, T[keyof T]>>,
  reValidateMode: ValidationMode = "onSubmit",
  rules?: ControlRules<T>
) => {
  return {
    defaultValues: defaultValues ?? {},
    reValidateMode,
    formValues: cloneDeep(defaultValues ?? {}) as T,
    fieldErrors: {} as FieldError<T>,
    rules: rules ?? ({} as ControlRules<T>),
  } as CreateControl<T>;
};

export { createControl };
