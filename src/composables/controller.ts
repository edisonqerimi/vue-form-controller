import { computed, onMounted, onUnmounted, watch } from "vue";
import {
  ControllerProps,
  ControlRule,
  DeepIndex,
  GetKeys,
  SetValueOptions,
} from "../types";

export const useController = <T, P extends GetKeys<T>>({
  rules,
  control,
  name,
  shouldUnregister,
  shouldClearErrorOnFocus = true,
  shouldUnregisterRule = true,
}: ControllerProps<T, P>) => {
  const value = computed(() => control.getValue(name));
  const isDirty = computed(() => control.getIsDirty(name));
  const errors = computed(() => control.getError(name));
  const reValidateMode = computed(() => control.reValidateMode.value);
  const hasErrors = computed(() => !!errors.value?.length);

  const setRule = (rules: ControlRule<T> | undefined) => {
    if (rules === undefined) {
      return;
    }
    control.setRule(name, rules);
  };

  watch(
    () => rules,
    () => {
      setRule(rules);
    },
  );

  onMounted(() => {
    setRule(rules);
  });

  onUnmounted(() => {
    if (shouldUnregister) {
      control.unregister(name);
    }
    if (shouldUnregisterRule) {
      control.clearRule(name);
    }
  });

  const onChange = (value: DeepIndex<T, P>, options?: SetValueOptions) => {
    control.setValue(name, value, options);
  };

  const onFocus = () => {
    if (!shouldClearErrorOnFocus) {
      return;
    }
    control.clearError(name);
  };

  const onBlur = () => {
    if (reValidateMode.value === "all" || reValidateMode.value === "onBlur") {
      control.validateField(name);
    }
  };

  return {
    value,
    errors,
    hasErrors,
    onChange,
    onFocus,
    onBlur,
    isDirty,
  };
};
