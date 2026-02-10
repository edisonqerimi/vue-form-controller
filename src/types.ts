import { ComputedRef } from "vue";

type StopTypes =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint
  | Date
  | RegExp;

type PathMapping<T> = {
  [K in keyof T & (string | number) as T[K] extends Function
    ? never
    : K]: T[K] extends StopTypes ? `${K}` : `${K}` | `${K}.${GetKeys<T[K]>}`;
};

export type GetKeys<T> = T extends StopTypes
  ? never
  : T extends (infer U)[]
    ?
        | `${number}`
        | `${number}.${GetKeys<U>}`
        | `[${number}]`
        | `[${number}].${GetKeys<U>}`
    : T extends object
      ? PathMapping<T>[keyof PathMapping<T>]
      : never;

type GetType<T, K extends string> = T extends (infer U)[]
  ? K extends `${number}` | `[${number}]`
    ? U
    : never
  : K extends keyof T
    ? T[K]
    : never;

export type DeepIndex<T, K extends string> = T extends StopTypes
  ? never
  : K extends `${infer F}.${infer R}`
    ? DeepIndex<GetType<T, F>, R>
    : GetType<T, K>;

export type CreateControl<T> = {
  defaultValues: T;
  reValidateMode: ValidationMode;
  formValues: T;
  fieldErrors: FieldError<T>;
  rules: ControlRules<T>;
};

export type ControlFunctionsType<T> = {
  setValue: <P extends GetKeys<T> = GetKeys<T>>(
    name: P,
    value: DeepIndex<T, P>,
    options?: SetValueOptions,
  ) => void;
  getValue: <P extends GetKeys<T> = GetKeys<T>>(name: P) => DeepIndex<T, P>;
  clearError: (name: GetKeys<T>) => void;
  setError: (name: GetKeys<T>, error: string[]) => void;
  setErrors: (errors: FieldError<T>) => void;
  getError: (name: GetKeys<T>) => string[] | undefined;
  getRule: (name: GetKeys<T>) => ControlRule<T> | undefined;
  setRules: (rules: ControlRules<T>) => void;
  setRule: (name: GetKeys<T>, rules: ControlRule<T>) => void;
  clearRule: (name: GetKeys<T>) => void;
  validateField: (name: GetKeys<T>) => string[];
  getIsDirty: (name: GetKeys<T>) => boolean;
  unregister: (name: GetKeys<T>) => void;
};

type Computed<T> = {
  [K in keyof T]: ComputedRef<T[K]>;
};

export type Control<T> = Computed<CreateControl<T>> & ControlFunctionsType<T>;

export type ValidationMode = "onBlur" | "onChange" | "onSubmit" | "all";

export type UseFormProps<T> = {
  defaultValues?: Partial<Record<keyof T, T[keyof T]>>;
  reValidateMode?: ValidationMode;
};

export type ControlRules<T> = Partial<Record<GetKeys<T>, ControlRule<T>>>;

export type ControlRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validate?: (value: never, fieldValues?: T) => string[] | undefined;
  pattern?: RegExp | string;
};

export type FieldError<T> = Partial<Record<GetKeys<T>, string[]>>;

export type ControllerProps<T, P extends GetKeys<T> = GetKeys<T>> = {
  control: Control<T>;
  name: P;
  rules?: ControlRule<T>;
  shouldUnregister?: boolean;
  shouldClearErrorOnFocus?: boolean;
  shouldUnregisterRule?: boolean;
};

export type SetValueOptions = {
  shouldValidate?: boolean;
  deepValidate?: boolean;
};
