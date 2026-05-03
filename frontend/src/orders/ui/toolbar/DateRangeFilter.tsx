"use client";

interface DateRangeFilterProps {
	dateFrom?: string;
	dateTo?: string;
	onChange: (range: { dateFrom?: string; dateTo?: string }) => void;
}

export function DateRangeFilter({ dateFrom = "", dateTo = "", onChange }: DateRangeFilterProps) {
	return (
		<fieldset className="grid min-h-11 w-full min-w-0 gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 sm:grid-cols-2">
			<legend className="sr-only">Rango de fechas</legend>
			<label
				htmlFor="orders-date-from"
				className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
			>
				Desde
				<input
					id="orders-date-from"
					name="dateFrom"
					type="date"
					value={dateFrom}
					onChange={(event) => onChange({ dateFrom: event.target.value, dateTo })}
					className="min-w-0 bg-transparent text-sm text-[var(--text-primary)] outline-none"
				/>
			</label>
			<label
				htmlFor="orders-date-to"
				className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
			>
				Hasta
				<input
					id="orders-date-to"
					name="dateTo"
					type="date"
					value={dateTo}
					onChange={(event) => onChange({ dateFrom, dateTo: event.target.value })}
					className="min-w-0 bg-transparent text-sm text-[var(--text-primary)] outline-none"
				/>
			</label>
		</fieldset>
	);
}
