import { Skeleton } from "@/core/ui/Skeleton";

interface TableSkeletonProps {
	rows?: number;
	cols?: number;
	className?: string;
}

let colKeyCounter = 0;
let rowKeyCounter = 0;
function nextColKey(): string {
	colKeyCounter += 1;
	return `tbl-col-${colKeyCounter}`;
}
function nextRowKey(): string {
	rowKeyCounter += 1;
	return `tbl-row-${rowKeyCounter}`;
}

export function TableSkeleton({ rows = 5, cols = 5, className }: TableSkeletonProps) {
	const colKeys = Array.from({ length: cols }, () => nextColKey());
	const rowKeys = Array.from({ length: rows }, () => nextRowKey());

	return (
		<section aria-label="Cargando tabla" className={className}>
			<div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
				<table className="min-w-full text-left text-sm">
					<caption className="sr-only">Cargando datos de la tabla</caption>
					<thead className="bg-[var(--surface-secondary)]/60">
						<tr>
							{colKeys.map((key) => (
								<th key={key} scope="col" className="px-4 py-3">
									<Skeleton variant="text" height={14} className="w-20" />
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]/60">
						{rowKeys.map((rowKey) => (
							<tr key={rowKey}>
								{colKeys.map((colKey) => (
									<td key={`${rowKey}-${colKey}`} className="px-4 py-3">
										<Skeleton
											variant="text"
											height={14}
											className={
												colKey === colKeys[0]
													? "w-3/4"
													: colKey === colKeys[colKeys.length - 1]
														? "w-1/4"
														: "w-1/2"
											}
										/>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
