"use client";

import { C_CONFORMITY_OPTIONS } from "./conformity-options";

interface SegmentOption {
	value: string;
	label: string;
	title?: string;
}

interface SegmentControlProps {
	options: readonly SegmentOption[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	ariaLabel?: string;
	name?: string;
}

function SegmentControl({
	options,
	value,
	onChange,
	disabled,
	ariaLabel,
	name,
}: SegmentControlProps) {
	return (
		<div className="flex gap-2" role="radiogroup" aria-label={ariaLabel ?? name}>
			{options.map((opt) => {
				const isSelected = value === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						disabled={disabled}
						title={opt.title ?? opt.label}
						onClick={() => onChange(isSelected ? "" : opt.value)}
						aria-pressed={isSelected}
						aria-label={opt.title ?? opt.label}
						className={[
							"flex h-11 min-w-[3.5rem] items-center justify-center rounded-xl border-2 px-3 text-xs font-bold transition-all",
							"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
							isSelected
								? "border-current bg-current/10 ring-2 ring-offset-1"
								: "border-border-default bg-surface-secondary text-text-muted hover:border-border-strong",
							disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
						].join(" ")}
						style={isSelected ? {} : undefined}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

export function ConformityControl(props: Omit<SegmentControlProps, "options">) {
	return <SegmentControl options={C_CONFORMITY_OPTIONS} {...props} />;
}
