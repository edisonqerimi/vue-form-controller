import { computed, onMounted, onUnmounted, toRef, watch } from "vue";
import {
  ControllerProps,
  ControlRule,
  DeepIndex,
  GetKeys,
  SetValueOptions,
} from "../types";

export const useController = <T, P extends GetKeys<T>>(
  props: ControllerProps<T, P>,
) => {
  const {
    control,
    name,
    shouldUnregister,
    shouldClearErrorOnFocus = true,
    shouldUnregisterRule = true,
  } = props;

  const rulesRef = toRef(props, "rules");

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
    rulesRef,
    (newRules) => {
      setRule(newRules);
    },
    { deep: true },
  );

  onMounted(() => {
    setRule(rulesRef.value);
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
