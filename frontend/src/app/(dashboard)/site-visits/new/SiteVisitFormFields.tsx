"use client";

interface TextFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "datetime-local";
	required?: boolean;
	readOnly?: boolean;
}

export function TextField({
	id,
	label,
	value,
	onChange,
	type = "text",
	required = false,
	readOnly = false,
}: TextFieldProps) {
	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				readOnly={readOnly}
				className={`min-h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)] ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
			/>
		</div>
	);
}

interface TextAreaFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export function TextAreaField({ id, label, value, onChange }: TextAreaFieldProps) {
	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
				{label}
			</label>
			<textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				rows={4}
				className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)]"
			/>
		</div>
	);
}
