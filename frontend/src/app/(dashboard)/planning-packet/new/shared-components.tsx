"use client";

import { CheckCircle, ChevronDown, ChevronUp, Plus, Trash2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

// ─── UI Components ──────────────────────────────────────────────────────────

// react-doctor(false-positive): control-has-associated-label — los inputs envueltos
// por FormField SÍ tienen <label htmlFor> asociado (renderizado aquí); el análisis
// estático no traza la asociación a través del wrapper.
export function FormField({
	label,
	required,
	htmlFor,
	children,
}: {
	label: string;
	required?: boolean;
	htmlFor?: string;
	children: ReactNode;
}) {
	const labelEl = (
		<>
			{label}
			{required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
		</>
	);
	return (
		<div className="grid gap-1.5">
			{htmlFor ? (
				<label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text-primary)]">
					{labelEl}
				</label>
			) : (
				<span className="text-sm font-medium text-[var(--text-primary)]">{labelEl}</span>
			)}
			{children}
		</div>
	);
}

export function CollapsibleSection({
	icon,
	title,
	count,
	expanded,
	onToggle,
	children,
}: {
	icon: ReactNode;
	title: string;
	count?: number;
	expanded: boolean;
	onToggle: () => void;
	children: ReactNode;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between p-4 text-left"
			>
				<span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-primary)]">
					<span className="text-[var(--color-brand)]">{icon}</span>
					{title}
					{count !== undefined && count > 0 && (
						<span className="rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-brand)]">
							{count}
						</span>
					)}
				</span>
				{expanded ? (
					<ChevronUp className="size-4 text-[var(--text-muted)]" />
				) : (
					<ChevronDown className="size-4 text-[var(--text-muted)]" />
				)}
			</button>
			{expanded && <div className="border-t border-[var(--border-subtle)] p-4">{children}</div>}
		</div>
	);
}

function ResourceTableRow<T>({
	row,
	index: i,
	renderRow,
	onRemove,
}: {
	row: T;
	index: number;
	renderRow: (row: T, index: number) => ReactNode;
	onRemove: (index: number) => void;
}) {
	const cells = renderRow(row, i);
	return (
		<tr className="group">
			{cells}
			<td className="pl-2 py-1.5">
				<button
					type="button"
					onClick={() => onRemove(i)}
					className="rounded p-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
					aria-label={`Eliminar fila ${i + 1}`}
				>
					<Trash2 className="size-3.5" />
				</button>
			</td>
		</tr>
	);
}

export function ResourceTable<T>({
	rows,
	columns,
	onAdd,
	onRemove,
	renderRow,
}: {
	rows: T[];
	columns: string[];
	onAdd: () => void;
	onRemove: (index: number) => void;
	renderRow: (row: T, index: number) => ReactNode;
}) {
	const stableKeys = useRef<string[]>([]);
	if (stableKeys.current.length < rows.length) {
		for (let i = stableKeys.current.length; i < rows.length; i++) {
			stableKeys.current.push(
				typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
			);
		}
	}
	if (stableKeys.current.length > rows.length) {
		stableKeys.current.length = rows.length;
	}

	return (
		<div className="space-y-2">
			{rows.length > 0 && (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border-subtle)]">
								{columns.map((col) => (
									<th
										key={col}
										scope="col"
										className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]"
									>
										{col}
									</th>
								))}
								<th scope="col" className="pb-2 w-8">
									<span className="sr-only">Acciones</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{rows.map((row, i) => (
								<ResourceTableRow
									key={stableKeys.current[i]}
									row={row}
									index={i}
									renderRow={renderRow}
									onRemove={onRemove}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}
			<button
				type="button"
				onClick={onAdd}
				className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
			>
				<Plus className="size-3.5" />
				Agregar fila
			</button>
		</div>
	);
}

export function ReadinessBadge({
	label,
	ready,
	count,
}: {
	label: string;
	ready: boolean;
	count: number;
}) {
	return (
		<div
			className={`flex items-center gap-2 rounded-[var(--radius-md)] border p-2.5 ${
				ready
					? "border-green-200 bg-green-50"
					: "border-[var(--border-default)] bg-[var(--surface-primary)]"
			}`}
		>
			{ready ? (
				<CheckCircle className="size-4 text-green-600 shrink-0" />
			) : (
				<XCircle className="size-4 text-[var(--text-muted)] shrink-0" />
			)}
			<div>
				<p className="text-xs font-medium text-[var(--text-primary)]">{label}</p>
				<p className="text-[10px] text-[var(--text-muted)]">{count} registros</p>
			</div>
		</div>
	);
}
