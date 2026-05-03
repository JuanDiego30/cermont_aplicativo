export function OrdersLoadingSkeleton() {
	const columns = ["code", "type", "asset", "status", "priority", "date"];
	const rows = ["one", "two", "three", "four", "five", "six"];

	return (
		<section
			aria-label="Cargando órdenes"
			className="overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]"
		>
			<div className="grid grid-cols-6 gap-4 border-b border-[var(--border-default)] bg-[var(--surface-secondary)] p-4">
				{columns.map((column) => (
					<div
						key={column}
						className="h-3 rounded-full bg-[var(--surface-tertiary)]"
						aria-hidden="true"
					/>
				))}
			</div>
			<div className="divide-y divide-[var(--border-default)]">
				{rows.map((row) => (
					<div key={row} className="grid grid-cols-6 gap-4 p-4">
						{columns.map((column) => (
							<div
								key={`${row}-${column}`}
								className="h-4 rounded-full bg-[var(--surface-secondary)]"
								aria-hidden="true"
							/>
						))}
					</div>
				))}
			</div>
		</section>
	);
}
