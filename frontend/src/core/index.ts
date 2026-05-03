/**
 * Core Module - Barrel Exports
 *
 * Centralized exports for primitives, hooks, and utilities
 * that are shared across multiple modules.
 *
 * Usage:
 *   import { Button, FormField, useSidebar } from '@/src/modules/core';
 */

// ========== Lib/Utils ==========
export * from "./lib";
// ========== UI Components ==========
export { Button } from "./ui/Button";
export { CreatableSelectField, type CreatableSelectOption } from "./ui/CreatableSelectField";
export {
	Checkbox,
	type CheckboxProps,
	FormField,
	type FormFieldProps,
	Select,
	type SelectProps,
	TextArea,
	type TextAreaProps,
	TextField,
	type TextFieldProps,
} from "./ui/FormField";
export { Logo } from "./ui/Logo";
export { PriorityBadge } from "./ui/PriorityBadge";
export { StatusBadge } from "./ui/StatusBadge";
