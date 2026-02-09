# Vue Form Controller

A lightweight, type-safe Vue 3 composable library for building forms with validation, providing a simple and flexible API for form state management.

## Features

✨ **Type-Safe** - Full TypeScript support with deep nested path typing  
🎯 **Flexible Validation** - Multiple validation modes and built-in validators  
🪶 **Lightweight** - Minimal dependencies, only requires Vue 3 and lodash  
🔄 **Reactive** - Built on Vue 3's composition API  
🎨 **Renderless** - Use the Controller component or composables directly  
📦 **Tree-Shakeable** - Import only what you need

## Installation

```bash
npm install vue-form-controller
```

```bash
yarn add vue-form-controller
```

```bash
pnpm add vue-form-controller
```

## Quick Start

```vue
<script setup lang="ts">
import { useForm, Controller } from "vue-form-controller";

interface FormData {
  email: string;
  password: string;
}

const { control, handleSubmit, isValid, isDirty } = useForm<FormData>({
  defaultValues: {
    email: "",
    password: "",
  },
  reValidateMode: "onChange",
});

const onSubmit = (data: FormData) => {
  console.log("Form submitted:", data);
};

const onError = (errors: any) => {
  console.log("Form errors:", errors);
};
</script>

<template>
  <form @submit.prevent="handleSubmit(onSubmit, onError)">
    <Controller
      :control="control"
      name="email"
      :rules="{
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      }"
      v-slot="{ value, onChange, onBlur, errors, hasErrors }"
    >
      <input
        type="email"
        :value="value"
        @input="onChange($event.target.value)"
        @blur="onBlur"
      />
      <span v-if="hasErrors">{{ errors[0] }}</span>
    </Controller>

    <Controller
      :control="control"
      name="password"
      :rules="{ required: true, minLength: 8 }"
      v-slot="{ value, onChange, onBlur, errors, hasErrors }"
    >
      <input
        type="password"
        :value="value"
        @input="onChange($event.target.value)"
        @blur="onBlur"
      />
      <span v-if="hasErrors">{{ errors[0] }}</span>
    </Controller>

    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>
```

## Validation Rules

### Built-in Validators

```typescript
interface ControlRule<T> {
  required?: boolean; // Field must have a value
  minLength?: number; // Minimum string length
  maxLength?: number; // Maximum string length
  pattern?: RegExp | string; // Regex pattern to match
  validate?: (
    // Custom validation function
    value: any,
    fieldValues?: T
  ) => string[] | undefined;
}
```

### Custom Validation

```typescript
const { control } = useForm<FormData>({
  defaultValues: { username: "" },
});

// In Controller rules:
{
  validate: (value, allValues) => {
    if (value.length < 3) {
      return ["Username must be at least 3 characters"];
    }
    if (allValues?.password && value === allValues.password) {
      return ["Username cannot be the same as password"];
    }
    return undefined; // No errors
  };
}
```

## Validation Modes

- **`onSubmit`** (default) - Validate on form submission
- **`onBlur`** - Validate when field loses focus
- **`onChange`** - Validate on every value change
- **`all`** - Validate on both blur and change

## Advanced Examples

### Nested Objects

```vue
<script setup lang="ts">
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface UserForm {
  name: string;
  address: Address;
}

const { control, handleSubmit } = useForm<UserForm>({
  defaultValues: {
    name: "",
    address: {
      street: "",
      city: "",
      zipCode: "",
    },
  },
});
</script>

<template>
  <Controller
    :control="control"
    name="address.street"
    :rules="{ required: true }"
    v-slot="{ value, onChange, errors }"
  >
    <input :value="value" @input="onChange($event.target.value)" />
    <span v-if="errors">{{ errors[0] }}</span>
  </Controller>
</template>
```

### Arrays

```vue
<script setup lang="ts">
interface TodoForm {
  todos: string[];
}

const { control } = useForm<TodoForm>({
  defaultValues: {
    todos: [""],
  },
});
</script>

<template>
  <Controller
    v-for="(_, index) in control.formValues.value.todos"
    :key="index"
    :control="control"
    :name="`todos.${index}`"
    v-slot="{ value, onChange }"
  >
    <input :value="value" @input="onChange($event.target.value)" />
  </Controller>
</template>
```

### Manual Control Operations

```typescript
const { control } = useForm<FormData>();

// Set a field value
control.setValue("email", "user@example.com");

// Get a field value
const email = control.getValue("email");

// Set field error
control.setError("email", ["Invalid email format"]);

// Clear field error
control.clearError("email");

// Validate a specific field
const errors = control.validateField("email");

// Check if field is dirty
const isDirty = control.getIsDirty("email");

// Unregister a field
control.unregister("email");
```

### Dynamic Rules

```vue
<script setup lang="ts">
const isDevelopment = ref(false);

const emailRules = computed(() => ({
  required: true,
  pattern: isDevelopment.value ? /.*/ : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}));
</script>

<template>
  <Controller
    :control="control"
    name="email"
    :rules="emailRules"
    v-slot="{ value, onChange, errors }"
  >
    <input :value="value" @input="onChange($event.target.value)" />
  </Controller>
</template>
```

### Form Reset

```typescript
const { control, reset } = useForm<FormData>({
  defaultValues: { email: "", password: "" },
});

// Reset to original defaults
reset({ email: "", password: "" });

// Reset with new defaults
reset({ email: "new@example.com", password: "" });
```

### Using Provide/Inject for Deeply Nested Components

Avoid prop drilling by using Vue's provide/inject pattern for deeply nested components.

**Parent Component:**

```vue
<script setup lang="ts">
import { provide } from "vue";
import { useForm } from "vue-form-controller";

const { control, handleSubmit } = useForm<FormData>({
  defaultValues: { name: "", email: "" },
});

// Provide control to all child components
provide("formControl", control);
</script>

<template>
  <form @submit.prevent="handleSubmit(onSubmit)">
    <NestedComponent />
  </form>
</template>
```

**Child Component:**

```vue
<script setup lang="ts">
import { inject } from "vue";
import { Controller, type Control } from "vue-form-controller";

// Inject control at any nesting level
const control = inject<Control<FormData>>("formControl")!;
</script>

<template>
  <Controller
    :control="control"
    name="email"
    :rules="{ required: true }"
    v-slot="{ value, onChange, errors }"
  >
    <input :value="value" @input="onChange($event.target.value)" />
    <span v-if="errors">{{ errors[0] }}</span>
  </Controller>
</template>
```

## TypeScript Support

The library provides full TypeScript support with deep path typing:

```typescript
interface User {
  profile: {
    address: {
      city: string;
    };
  };
}

const { control } = useForm<User>();

// ✅ Type-safe - 'profile.address.city' is valid
control.setValue("profile.address.city", "New York");

// ❌ Type error - 'profile.invalid' is not a valid path
control.setValue("profile.invalid", "value");
```

## Control API

The `control` object provides the following methods:

| Method                   | Description                     |
| ------------------------ | ------------------------------- |
| `setValue(name, value)`  | Set a field value               |
| `getValue(name)`         | Get a field value               |
| `setError(name, errors)` | Set field errors                |
| `clearError(name)`       | Clear field errors              |
| `setErrors(errors)`      | Set multiple field errors       |
| `getError(name)`         | Get field errors                |
| `validateField(name)`    | Validate a specific field       |
| `setRule(name, rule)`    | Set validation rule for a field |
| `setRules(rules)`        | Set multiple validation rules   |
| `getRule(name)`          | Get validation rule for a field |
| `getIsDirty(name)`       | Check if field value changed    |
| `unregister(name)`       | Remove field from form state    |

## Error Messages

Default error messages:

- **Required**: "Field is required!"
- **Min Length**: "The field may not be shorter than {n} characters!"
- **Max Length**: "The field may not be longer than {n} characters!"
- **Pattern**: "The field did not match the expected pattern!"

Customize error messages using the `validate` function:

```typescript
{
  validate: (value) => {
    if (!value) return ["This field is required"];
    if (value.length < 5) return ["Must be at least 5 characters"];
    return undefined;
  };
}
```

## API Reference

### `useForm<T>(props?)`

Creates a form instance with validation and state management.

#### Parameters

```typescript
interface UseFormProps<T> {
  defaultValues?: Partial<Record<keyof T, T[keyof T]>>;
  reValidateMode?: "onBlur" | "onChange" | "onSubmit" | "all";
}
```

#### Returns

```typescript
{
  control: Control<T>;           // Control object to pass to Controller
  handleSubmit: (
    onSubmit: (data: T) => void | Promise<void>,
    onError?: (errors: FieldError<T>) => void | Promise<void>
  ) => Promise<void>;
  isSubmitting: Ref<boolean>;    // True during async submission
  isDirty: ComputedRef<boolean>; // True if form values differ from defaults
  isValid: ComputedRef<boolean>; // True if no validation errors
  reset: (defaultValues: Partial<Record<keyof T, T[keyof T]>>) => void;
  formStates: Readonly<CreateControl<T>>; // Read-only form state
}
```

### `useController<T, P>(props)`

A composable for creating controlled form inputs.

#### Parameters

```typescript
interface ControllerProps<T, P extends GetKeys<T>> {
  control: Control<T>;
  name: P;
  rules?: ControlRule<T>;
  shouldUnregister?: boolean;
  shouldClearErrorOnFocus?: boolean;
  shouldUnregisterRule?: boolean;
}
```

#### Returns

```typescript
{
  value: ComputedRef<DeepIndex<T, P>>;
  errors: ComputedRef<string[] | undefined>;
  hasErrors: ComputedRef<boolean>;
  isDirty: ComputedRef<boolean>;
  onChange: (value: DeepIndex<T, P>) => void;
  onFocus: () => void;
  onBlur: () => void;
}
```

### `<Controller />` Component

A renderless component that provides form control functionality via scoped slots.

#### Props

Same as `useController` props above.

#### Slot Props

```typescript
{
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  onFocus: () => void;
  errors: string[] | undefined;
  hasErrors: boolean;
  isDirty: boolean;
}
```

## Peer Dependencies

- Vue 3.5.24 or higher

## License

ISC

## Author

Edison Qerimi

## Repository

[https://github.com/edisonqerimi/vue-form-controller](https://github.com/edisonqerimi/vue-form-controller)

## Issues

Report issues at [https://github.com/edisonqerimi/vue-form-controller/issues](https://github.com/edisonqerimi/vue-form-controller/issues)
