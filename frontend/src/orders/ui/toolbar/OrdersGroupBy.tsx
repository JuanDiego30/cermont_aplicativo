"use client";

import type { OrdersGroupByValue } from "./toolbar-options";
import { GROUP_BY_OPTIONS } from "./toolbar-options";

interface OrdersGroupByProps {
	value: OrdersGroupByValue;
	onChange: (value: OrdersGroupByValue) => void;
}

export function OrdersGroupBy({ value, onChange }: OrdersGroupByProps) {
	return (
		<label
			htmlFor="orders-groupBy"
			className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-secondary)]"
		>
			<span className="font-medium">Agrupar</span>
			<select
				id="orders-groupBy"
				name="groupBy"
				value={value}
				onChange={(event) => onChange(event.target.value as OrdersGroupByValue)}
				className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--text-primary)] outline-none"
			>
				{GROUP_BY_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
