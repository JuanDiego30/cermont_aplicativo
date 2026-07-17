"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VirtualTableColumn<T> {
	key: string;
	header: string;
	render: (row: T) => ReactNode;
	className?: string;
	width?: string;
}

interface VirtualTableProps<T> {
	data: T[];
	columns: VirtualTableColumn<T>[];
	rowHeight?: number;
	maxHeight?: number;
	overscan?: number;
	onRowClick?: (row: T) => void;
	getRowId: (row: T, index: number) => string;
	className?: string;
}

export function VirtualTable<T>({
	data,
	columns,
	rowHeight = 48,
	maxHeight = 600,
	overscan = 5,
	onRowClick,
	getRowId,
	className,
}: VirtualTableProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	}, []);

	const visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
	const visibleEnd = Math.min(
		data.length,
		Math.ceil((scrollTop + maxHeight) / rowHeight) + overscan,
	);
	const visibleData = data.slice(visibleStart, visibleEnd);
	const spacerHeight = visibleStart * rowHeight;
	const trailingSpacerHeight = (data.length - visibleEnd) * rowHeight;

	const handleKeyDown = (e: React.KeyboardEvent, row: T) => {
		if (onRowClick && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			onRowClick(row);
		}
	};

	return (
		<div
			ref={containerRef}
			onScroll={handleScroll}
			className={cn(
				"overflow-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)]",
				className,
			)}
			style={{ maxHeight: `${maxHeight}px` }}
			data-testid="virtual-table"
		>
			<table className="w-full border-collapse">
				<thead className="sticky top-0 z-10">
					<tr
						className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]"
						style={{ height: `${rowHeight}px` }}
					>
						{columns.map((col) => (
							<th
								key={col.key}
								className={cn(
									"px-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]",
									col.className,
								)}
								style={{ width: col.width, minWidth: col.width ?? "120px" }}
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="py-12 text-center text-sm text-[var(--text-muted)]"
							>
								Sin datos para mostrar
							</td>
						</tr>
					) : (
						<>
							{spacerHeight > 0 && (
								<tr style={{ height: `${spacerHeight}px` }}>
									<td colSpan={columns.length} style={{ padding: 0, border: "none" }} />
								</tr>
							)}
							{visibleData.map((row, idx) => {
								const rowIndex = visibleStart + idx;
								const rowId = getRowId(row, rowIndex);
								return (
									<tr
										key={rowId}
										className={cn(
											"border-b border-[var(--border-subtle)] transition-colors",
											onRowClick && "cursor-pointer hover:bg-[var(--surface-secondary)]",
										)}
										style={{ height: `${rowHeight}px` }}
										onClick={onRowClick ? () => onRowClick(row) : undefined}
										onKeyDown={onRowClick ? (e) => handleKeyDown(e, row) : undefined}
										tabIndex={onRowClick ? 0 : undefined}
									>
										{columns.map((col) => (
											<td
												key={col.key}
												className={cn(
													"px-4 text-sm text-[var(--text-primary)] truncate",
													col.className,
												)}
												style={{ width: col.width, minWidth: col.width ?? "120px" }}
											>
												{col.render(row)}
											</td>
										))}
									</tr>
								);
							})}
							{trailingSpacerHeight > 0 && (
								<tr style={{ height: `${trailingSpacerHeight}px` }}>
									<td colSpan={columns.length} style={{ padding: 0, border: "none" }} />
								</tr>
							)}
						</>
					)}
				</tbody>
			</table>
		</div>
	);
}
