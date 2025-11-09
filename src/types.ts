import { ComputedRef } from "vue";

type StopTypes = number | string | boolean | symbol | bigint | Date;

type ExcludedTypes = (...args: any[]) => any;

type Dot<T extends string, U extends string> = "" extends U ? T : `${T}.${U}`;

export type GetKeys<T> = T extends StopTypes
  ? ""
  : T extends readonly unknown[]
  ? GetKeys<T[number]>
  : {
      [K in keyof T & string]: T[K] extends StopTypes
        ? K
        : T[K] extends ExcludedTypes
        ? never
        : K | Dot<K, GetKeys<T[K]>>;
    }[keyof T & string];

type Idx<T, K extends string> = K extends keyof T ? T[K] : never;

export type DeepIndex<T, K extends string> = T extends object
  ? K extends `${infer F}.${infer R}`
    ? DeepIndex<Idx<T, F>, R>
    : Idx<T, K>
  : never;

export type CreateControl<T> = {
  defaultValues: T;
  reValidateMode: ValidationMode;
  formValues: T;
  fieldErrors: FieldError<T>;
  rules: ControlRules<T>;
};

export type ControlFunctionsType<T> = {
  setValue: <P extends GetKeys<T>>(name: P, value: DeepIndex<T, P>) => void;
  setValues: (values?: T) => void;
  getValue: <P extends GetKeys<T>>(name: P) => DeepIndex<T, P>;
  clearError: (name: GetKeys<T>) => void;
  setError: (name: GetKeys<T>, error: string[]) => void;
  setErrors: (errors: FieldError<T>) => void;
  getError: (name: GetKeys<T>) => string[] | undefined;
  getRule: (name: GetKeys<T>) => ControlRule<T> | undefined;
  setRules: (rules: ControlRules<T>) => void;
  setRule: (name: GetKeys<T>, rules: ControlRule<T>) => void;
  validateField: (name: GetKeys<T>) => string[];
  getIsDirty: (name: GetKeys<T>) => boolean;
  unregister: (name: GetKeys<T>) => void;
};

export type Control<T> = Record<
  keyof CreateControl<T>,
  ComputedRef<CreateControl<T>[keyof CreateControl<T>]>
> &
  ControlFunctionsType<T>;

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

export type ControllerProps<T, P extends GetKeys<T> = any> = {
  control: Control<T>;
  name: P;
  rules?: ControlRule<T>;
  shouldUnregister?: boolean;
};
