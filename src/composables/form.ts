import { computed, readonly, ref, type Ref } from "vue";

import { get, isEqual, set, unset } from "lodash";
import {
  Control,
  ControlRule,
  ControlRules,
  CreateControl,
  DeepIndex,
  FieldError,
  GetKeys,
  SetValueOptions,
  UseFormProps,
} from "../types";
import { createControl } from "../control";
import { getFieldErrors } from "../validations";

export const useForm = <T>(props?: UseFormProps<T>) => {
  const control: Ref<CreateControl<T>> = ref(
    createControl(props?.defaultValues, props?.reValidateMode || "onSubmit"),
  ) as Ref<CreateControl<T>>;

  const isSubmitting = ref(false);

  const handleSubmit = async (
    onSubmit: (data: T) => void | Promise<void>,
    onError?: (errors: FieldError<T>) => void | Promise<void>,
  ) => {
    const rules = control.value.rules;
    const fieldValues = formValues.value as T;
    const controlErrors: FieldError<T> = {};
    let hasErrors = false;
    Object.keys(rules ?? {}).forEach((key) => {
      const name = key as GetKeys<T>;
      const errors = getCurrentFieldErrors(name);

      if (errors.length) {
        controlErrors[name] = errors;
        hasErrors = true;
      }
    });

    setErrors(controlErrors);

    if (hasErrors) {
      onError?.(controlErrors);
      return;
    }
    try {
      isSubmitting.value = true;
      await onSubmit?.(fieldValues);
    } finally {
      isSubmitting.value = false;
    }
  };

  const reset = (defaultValues: Partial<Record<keyof T, T[keyof T]>>) => {
    control.value = createControl(
      defaultValues,
      props?.reValidateMode || "onSubmit",
      control.value.rules,
    );
  };
  const setValue = <P extends GetKeys<T>>(
    name: P,
    value: DeepIndex<T, P> | ((prev: DeepIndex<T, P>) => DeepIndex<T, P>),
    options: SetValueOptions = { shouldValidate: true },
  ) => {
    let newValue: DeepIndex<T, P>;
    if (typeof value === "function") {
      const prevValue = getValue(name);
      newValue = (value as (prev: DeepIndex<T, P>) => DeepIndex<T, P>)(
        prevValue,
      );
    } else {
      newValue = value as DeepIndex<T, P>;
    }

    set(control.value.formValues as object, name, newValue);

    if (
      options?.shouldValidate &&
      (reValidateMode.value === "all" || reValidateMode.value === "onChange")
    ) {
      validateField(name);
    }
  };

  const getValue = <P extends GetKeys<T>>(name: P) => {
    return get(control.value.formValues, name) as DeepIndex<T, P>;
  };

  const clearError = (name: GetKeys<T>) => {
    delete control.value.fieldErrors[name];
  };

  const setError = (name: GetKeys<T>, error: string[]) => {
    control.value.fieldErrors[name] = error;
  };

  const setErrors = (errors: FieldError<T>) => {
    control.value.fieldErrors = errors;
  };

  const getError = (name: GetKeys<T>) => control.value.fieldErrors[name];

  const getRule = (name: GetKeys<T>) =>
    control.value.rules[name] as ControlRule<T>;

  const setRules = (rules: ControlRules<T>) => {
    control.value.rules = rules;
  };

  const setRule = (name: GetKeys<T>, rules: ControlRule<T>) => {
    control.value.rules[name] = rules;
  };

  const clearRule = (name: GetKeys<T>) => {
    delete control.value.rules[name];
  };

  const unregister = (name: GetKeys<T>) => {
    unset(control.value.formValues, name);
  };

  const getIsDirty = (name: GetKeys<T>) =>
    !isEqual(getValue(name), get(control.value.defaultValues, name));

  const readonlyControl = readonly(control);
  const reValidateMode = computed(() => readonlyControl.value.reValidateMode);
  const fieldErrors = computed(
    () => readonlyControl.value.fieldErrors as FieldError<T>,
  );
  const formValues = computed(() => readonlyControl.value.formValues);
  const defaultValues = computed(() => readonlyControl.value.defaultValues);
  const rules = computed(() => readonlyControl.value.rules);

  const isDirty = computed(
    () => !isEqual(formValues.value, defaultValues.value),
  );

  const isValid = computed(
    () =>
      !Object.entries(fieldErrors.value ?? {}).some(
        ([, v]) => (v as string[])?.length,
      ),
  );

  const getCurrentFieldErrors = (name: GetKeys<T>) =>
    getFieldErrors(getValue(name), getRule(name), formValues.value as T);

  const validateField = (name: GetKeys<T>) => {
    const errors = getCurrentFieldErrors(name);
    if (!errors?.length) {
      clearError(name);
      return [];
    }
    setError(name, errors);
    return errors;
  };

  return {
    control: {
      setValue,
      getValue,
      clearError,
      setError,
      setErrors,
      getError,
      getRule,
      setRules,
      setRule,
      reValidateMode,
      fieldErrors,
      formValues,
      defaultValues,
      rules,
      validateField,
      getIsDirty,
      unregister,
      clearRule,
    } as Control<T>,
    handleSubmit,
    isSubmitting,
    isDirty,
    reset,
    formStates: readonlyControl,
    isValid,
  };
};
