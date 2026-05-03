"use client";

interface TechnicianFilterProps {
	value?: string;
	onChange: (value: string) => void;
}

export function TechnicianFilter({ value = "", onChange }: TechnicianFilterProps) {
	return (
		<label
			htmlFor="orders-technicianId"
			className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-secondary)]"
		>
			<span className="font-medium">Técnico</span>
			<input
				id="orders-technicianId"
				name="technicianId"
				value={value}
				onChange={(event) => onChange(event.target.value.trim())}
				placeholder="ID técnico"
				className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
			/>
		</label>
	);
}
