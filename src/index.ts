export { useController } from "./composables/controller";
export { useForm } from "./composables/form";
import Controller from "./components/Controller.vue";

export type {
  ValidationMode,
  ControllerProps,
  ControlRules,
  ControlRule,
  UseFormProps,
  Control,
  FieldError,
  GetKeys,
  DeepIndex,
} from "./types";

export { Controller };
