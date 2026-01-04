import { computed, onUnmounted, watch } from "vue";
import { ControllerProps, DeepIndex, GetKeys } from "../types";

export const useController = <T, P extends GetKeys<T>>({
  rules,
  control,
  name,
  shouldUnregister,
  shouldClearErrorOnFocus = true,
}: ControllerProps<T, P>) => {
  const value = computed(() => control.getValue(name));
  const isDirty = computed(() => control.getIsDirty(name));
  const errors = computed(() => control.getError(name));
  const reValidateMode = computed(() => control.reValidateMode.value);
  const hasErrors = computed(() => !!errors.value?.length);

  watch(
    () => rules,
    () => {
      if (rules === undefined) {
        return;
      }
      control.setRule(name, rules);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (shouldUnregister) {
      control.unregister(name);
    }
  });

  const onChange = (value: DeepIndex<T, P>) => {
    control.setValue(name, value);
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
