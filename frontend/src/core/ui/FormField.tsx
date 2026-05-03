"use client";

import { X } from "lucide-react";
import {
	Children,
	cloneElement,
	type InputHTMLAttributes,
	isValidElement,
	type ReactNode,
	type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/_shared/lib/utils";

/**
 * FormField - Wrapper component for form inputs with label and error display
 *
 * Features:
 * - Consistent styling across all forms
 * - Error state with red border and message
 * - Required indicator (asterisk)
 * - Helper text support
 * - Accessible labels with htmlFor
 */

export interface FormFieldProps {
	/** Field name for form registration */
	name?: string;
	/** Field label */
	label?: ReactNode;
	/** Error message to display */
	error?: string;
	/** Helper text below the input */
	helperText?: string;
	/** Whether the field is required */
	required?: boolean;
	/** ID for label association (defaults to name) */
	htmlFor?: string;
	/** Additional label classes */
	labelClassName?: string;
	/** Additional error classes */
	errorClassName?: string;
	/** Additional helper text classes */
	helperTextClassName?: string;
	/** Children (input, select, etc.) */
	children: ReactNode;
	/** Additional class names */
	className?: string;
}

interface RequiredAwareChildProps {
	"aria-required"?: boolean | "true" | "false";
}

function withRequiredAria(children: ReactNode, required: boolean): ReactNode {
	if (!required) {
		return children;
	}

	return Children.map(children, (child) => {
		if (!isValidElement<RequiredAwareChildProps>(child)) {
			return child;
		}

		return cloneElement(child, {
			"aria-required": child.props["aria-required"] ?? true,
		});
	});
}

export function FormField({
	name,
	label,
	error,
	helperText,
	required = false,
	htmlFor,
	labelClassName,
	errorClassName,
	helperTextClassName,
	children,
	className,
}: FormFieldProps) {
	const labelId = htmlFor || name;
	const describedChildren = withRequiredAria(children, required);

	return (
		<div className={cn("space-y-1.5", className)}>
			{label ? (
				<label
					htmlFor={labelId}
					className={cn("block text-sm font-medium text-[var(--text-secondary)]", labelClassName)}
				>
					{label}
					{required ? <span className="ml-0.5 text-[var(--color-danger)]">*</span> : null}
				</label>
			) : null}

			{describedChildren}

			{error ? (
				<p className={cn("text-sm text-[var(--color-danger)]", errorClassName)} role="alert">
					{error}
				</p>
			) : null}

			{helperText && !error ? (
				<p className={cn("text-sm text-[var(--text-tertiary)]", helperTextClassName)}>
					{helperText}
				</p>
			) : null}
		</div>
	);
}

/**
 * TextField - Styled input component for text input
 *
 * Features:
 * - Consistent styling with design system
 * - Error state styling
 * - Focus ring
 * - Dark mode support
 * - Accessible
 */

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
	/** Error state */
	error?: boolean;
	/** Size variant */
	size?: "sm" | "md" | "lg";
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	onClear?: () => void;
	ref?: React.Ref<HTMLInputElement>;
}

export const TextField = ({
	className,
	error,
	size = "md",
	type = "text",
	leftIcon,
	rightIcon,
	onClear,
	ref,
	...props
}: TextFieldProps) => {
	const sizeClasses = {
		sm: "h-8 px-2 text-sm",
		md: "h-9 px-3 text-sm",
		lg: "h-11 px-4 text-base",
	};

	return (
		<div className="relative w-full">
			{leftIcon ? (
				<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
					{leftIcon}
				</span>
			) : null}
			<input
				type={type}
				ref={ref}
				{...props}
				className={cn(
					"w-full rounded-[var(--radius-md)] border bg-[var(--surface-primary)] text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-tertiary)]",
					sizeClasses[size],
					leftIcon ? "pl-10" : "",
					rightIcon || onClear ? "pr-10" : "",
					error
						? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
						: "border-[var(--border-default)] focus:border-[var(--border-focus)]",
					className,
				)}
				aria-invalid={error ? true : props["aria-invalid"]}
				aria-required={props["aria-required"]}
			/>
			{onClear ? (
				<button
					type="button"
					onClick={onClear}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
					aria-label="Limpiar campo"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			) : rightIcon ? (
				<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
					{rightIcon}
				</span>
			) : null}
		</div>
	);
};

TextField.displayName = "TextField";

/**
 * TextArea - Styled textarea component
 */

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Error state */
	error?: boolean;
	ref?: React.Ref<HTMLTextAreaElement>;
}

export const TextArea = ({ className, error, ref, ...props }: TextAreaProps) => {
	return (
		<textarea
			ref={ref}
			{...props}
			className={cn(
				"w-full rounded-[var(--radius-md)] border bg-[var(--surface-primary)] px-3 py-2 text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-tertiary)] resize-y min-h-[80px]",
				error
					? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
					: "border-[var(--border-default)] focus:border-[var(--border-focus)]",
				"resize-y min-h-[80px]",
				className,
			)}
			aria-invalid={error ? true : props["aria-invalid"]}
			aria-required={props["aria-required"]}
		/>
	);
};

TextArea.displayName = "TextArea";

/**
 * Select - Styled select component
 */

export interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "size"> {
	/** Error state */
	error?: boolean;
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Options */
	children: ReactNode;
	ref?: React.Ref<HTMLSelectElement>;
}

export const Select = ({ className, error, size = "md", children, ref, ...props }: SelectProps) => {
	const sizeClasses = {
		sm: "h-8 px-2 text-sm",
		md: "h-10 px-3 text-base",
		lg: "h-12 px-4 text-lg",
	};

	return (
		<select
			ref={ref}
			{...props}
			className={cn(
				"w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border bg-[var(--surface-primary)] text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-tertiary)]",
				sizeClasses[size],
				'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E")]',
				"bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10",
				error
					? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
					: "border-[var(--border-default)] focus:border-[var(--border-focus)]",
				className,
			)}
			aria-invalid={error ? true : props["aria-invalid"]}
			aria-required={props["aria-required"]}
		>
			{children}
		</select>
	);
};

Select.displayName = "Select";

/**
 * Checkbox - Styled checkbox component
 */

export interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	/** Label text */
	label?: ReactNode;
	/** Error state */
	error?: boolean;
	ref?: React.Ref<HTMLInputElement>;
}

export const Checkbox = ({ className, label, error, ref, ...props }: CheckboxProps) => {
	return (
		<label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
			<input
				type="checkbox"
				ref={ref}
				className={cn(
					"h-4 w-4 rounded border transition-colors cursor-pointer text-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
					error ? "border-[var(--color-danger)]" : "border-[var(--border-default)]",
				)}
				{...props}
			/>
			{label && <span className="select-none text-sm text-[var(--text-secondary)]">{label}</span>}
		</label>
	);
};

Checkbox.displayName = "Checkbox";

export default FormField;
