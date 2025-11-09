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
  UseFormProps,
} from "../types";
import { createControl } from "../control";
import { getFieldErrors } from "../validations";

export const useForm = <T>(props?: UseFormProps<T>) => {
  // @ts-expect-error UnwrapRef issue
  const control: Ref<CreateControl<T>> = ref(
    createControl(props?.defaultValues, props?.reValidateMode || "onSubmit")
  );

  const isSubmitting = ref(false);

  const handleSubmit = async (onSubmit: (data: T) => void | Promise<void>) => {
    const rules = control.value.rules;
    const fieldValues = formValues.value as T;
    const controlErrors: FieldError<T> = {};
    let hasErrors = false;
    Object.keys(rules ?? {}).forEach((key) => {
      const name = key as GetKeys<T>;
      const errors = getCurrentFieldErrors(name);
      controlErrors[name] = errors;
      if (errors.length) {
        hasErrors = true;
      }
    });
    if (hasErrors) {
      setErrors(controlErrors);
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
      control.value.rules
    );
  };
  const setValue = <P extends GetKeys<T>>(name: P, value: DeepIndex<T, P>) => {
    set(control.value.formValues as object, name, value) as T;
    if (reValidateMode.value === "all" || reValidateMode.value === "onChange") {
      validateField(name);
    }
  };

  const setValues = (values?: T) => {
    control.value.formValues = values ?? ({} as T);
  };

  const getValue = <P extends GetKeys<T>>(name: P) => {
    return get(control.value.formValues, name) as DeepIndex<T, P>;
  };

  const clearError = (name: GetKeys<T>) => {
    set(control.value.fieldErrors, name, []);
  };

  const setError = (name: GetKeys<T>, error: string[]) => {
    set(control.value.fieldErrors, name, error);
  };

  const setErrors = (errors: FieldError<T>) => {
    control.value.fieldErrors = errors;
  };

  const getError = (name: GetKeys<T>) => get(control.value.fieldErrors, name);

  const getRule = (name: GetKeys<T>) =>
    get(control.value.rules, name) as ControlRule<T>;

  const setRules = (rules: ControlRules<T>) => {
    control.value.rules = rules;
  };

  const setRule = (name: GetKeys<T>, rules: ControlRule<T>) => {
    set(control.value.rules, name, rules);
  };

  const unregister = (name: GetKeys<T>) => {
    unset(control.value.formValues as object, name);
  };

  const getIsDirty = (name: GetKeys<T>) =>
    getValue(name) !== get(control.value.defaultValues, name);

  const readonlyControl = computed(() => readonly(control.value));
  const reValidateMode = computed(() => readonlyControl.value.reValidateMode);
  const fieldErrors = computed(
    () => readonlyControl.value.fieldErrors as FieldError<T>
  );
  const formValues = computed(() => readonlyControl.value.formValues);
  const defaultValues = computed(() => readonlyControl.value.defaultValues);
  const rules = computed(() => readonlyControl.value.rules);

  const isDirty = computed(
    () => !isEqual(formValues.value, defaultValues.value)
  );

  const isValid = computed(
    () =>
      !Object.entries(fieldErrors.value ?? {}).some(
        ([, v]) => (v as string[])?.length
      )
  );

  const getCurrentFieldErrors = (name: GetKeys<T>) =>
    getFieldErrors(getValue(name), getRule(name));

  const validateField = (name: GetKeys<T>) => {
    const errors = getCurrentFieldErrors(name);
    setError(name, errors);
    return errors;
  };

  return {
    control: {
      setValue,
      setValues,
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
    } as Control<T>,
    handleSubmit,
    isSubmitting,
    isDirty,
    reset,
    formStates: readonlyControl,
    isValid,
  };
};
