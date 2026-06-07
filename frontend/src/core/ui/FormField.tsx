"use client";

import { X } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
	name?: string;
	label?: ReactNode;
	error?: string;
	helperText?: string;
	required?: boolean;
	htmlFor?: string;
	labelClassName?: string;
	errorClassName?: string;
	helperTextClassName?: string;
	children: ReactNode;
	className?: string;
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

	return (
		<div className={cn("space-y-2", className)}>
			{label ? (
				<label
					htmlFor={labelId}
					className={cn("block text-sm font-medium text-[var(--text-secondary)]", labelClassName)}
				>
					{label}
					{required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
				</label>
			) : null}

			{children}

			{error ? (
				<p
					className={cn("text-xs font-medium text-[var(--color-danger)]", errorClassName)}
					role="alert"
				>
					{error}
				</p>
			) : null}

			{helperText && !error ? (
				<p className={cn("text-xs text-[var(--text-tertiary)]", helperTextClassName)}>
					{helperText}
				</p>
			) : null}
		</div>
	);
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
	error?: boolean;
	size?: "sm" | "md" | "lg";
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	onClear?: () => void;
	ref?: Ref<HTMLInputElement>;
}

const TEXT_FIELD_SIZE_CLASSES = {
	sm: "h-9 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-12 px-6 text-base",
} as const;

export function TextField({
	className,
	error,
	size = "md",
	type = "text",
	leftIcon,
	rightIcon,
	onClear,
	ref,
	...props
}: TextFieldProps) {
	return (
		<div className="relative w-full">
			{leftIcon ? (
				<span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
					{leftIcon}
				</span>
			) : null}
			<input
				type={type}
				ref={ref}
				className={cn(
					"motion-input w-full rounded-full border bg-[var(--surface-primary)] text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)]",
					TEXT_FIELD_SIZE_CLASSES[size],
					leftIcon ? "pl-11" : "",
					rightIcon || onClear ? "pr-11" : "",
					error
						? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
						: "border-[var(--border-medium)] focus:border-[var(--color-focus-ring)]",
					className,
				)}
				{...props}
			/>
			{onClear ? (
				<button
					type="button"
					onClick={onClear}
					className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
					aria-label="Limpiar campo"
				>
					<X className="size-4" aria-hidden="true" />
				</button>
			) : rightIcon ? (
				<span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
					{rightIcon}
				</span>
			) : null}
		</div>
	);
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
	ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ className, error, ref, ...props }: TextAreaProps) {
	return (
		<textarea
			ref={ref}
			className={cn(
				"motion-input w-full rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] px-4 py-3 text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)] resize-y min-h-[100px]",
				error
					? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
					: "border-[var(--border-medium)] focus:border-[var(--color-focus-ring)]",
				className,
			)}
			{...props}
		/>
	);
}

export interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "size"> {
	error?: boolean;
	size?: "sm" | "md" | "lg";
	children: ReactNode;
	ref?: Ref<HTMLSelectElement>;
}

const SELECT_SIZE_CLASSES = {
	sm: "h-9 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-12 px-6 text-base",
} as const;

export function Select({ className, error, size = "md", children, ref, ...props }: SelectProps) {
	return (
		<div className="relative w-full">
			<select
				ref={ref}
				className={cn(
					"motion-input w-full cursor-pointer appearance-none rounded-full border bg-[var(--surface-primary)] text-[var(--text-primary)] transition-[border-color,box-shadow,background-color,color] duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)]",
					SELECT_SIZE_CLASSES[size],
					"bg-[right_1rem_center] bg-no-repeat pr-10",
					error
						? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[color:var(--color-danger)]/20"
						: "border-[var(--border-medium)] focus:border-[var(--color-focus-ring)]",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 20 20"
					className="size-5"
					aria-hidden="true"
				>
					<path
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
						d="M6 8l4 4 4-4"
					/>
				</svg>
			</div>
		</div>
	);
}

export interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	label?: ReactNode;
	error?: boolean;
	ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ className, label, error, ref, ...props }: CheckboxProps) {
	return (
		<label className={cn("inline-flex items-center gap-2.5 cursor-pointer group", className)}>
			<input
				type="checkbox"
				ref={ref}
				className={cn(
					"motion-input size-4.5 rounded border transition-[border-color,background-color,box-shadow,transform,opacity] cursor-pointer text-brand focus:ring-2 focus:ring-(--color-focus-ring)/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
					error ? "border-destructive" : "border-border-medium group-hover:border-brand",
				)}
				{...props}
			/>
			{label ? (
				<span className="select-none text-sm text-muted-foreground group-hover:text-foreground transition-colors">
					{label}
				</span>
			) : null}
		</label>
	);
}
