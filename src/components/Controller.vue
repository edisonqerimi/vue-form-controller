<template>
  <slot
    :onChange="onChange"
    :onBlur="onBlur"
    :value="value"
    :errors="errors"
    :hasErrors="hasErrors"
    :onFocus="onFocus"
    :isDirty="isDirty"
  ></slot>
</template>

<script setup lang="ts" generic="T, P extends GetKeys<T>">
import type { GetKeys, ControllerProps } from "../types";
import { useController } from "../composables/controller";

const props = withDefaults(defineProps<ControllerProps<T, P>>(), {
  shouldClearErrorOnFocus: true,
});
const { onChange, onBlur, onFocus, errors, hasErrors, value, isDirty } =
  useController(props);
</script>
