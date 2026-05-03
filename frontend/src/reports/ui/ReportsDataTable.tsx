"use client";

import type { ReportPipelineItem } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/core/ui/Button";
import { Pagination } from "@/core/ui/Pagination";
import { useReportPipeline } from "@/reports/queries";
import { type SortDirection, useTableSort } from "../hooks/useTableSort";
import { ExportMenu } from "./ExportMenu";
import { ReportDetailSheet } from "./ReportDetailSheet";
import { ReportStatusBadge } from "./ReportStatusBadge";

type SortKey =
	| "code"
	| "assetName"
	| "createdBy"
	| "status"
	| "createdAt"
	| "completedAt"
	| "daysWaiting"
	| "reportStatus";

const PAGE_SIZE = 10;

const SORT_ACCESSORS: Record<SortKey, (item: ReportPipelineItem) => string | number | Date> = {
	code: (item) => item.code,
	assetName: (item) => item.assetName,
	createdBy: (item) => item.createdBy,
	status: (item) => item.status,
	createdAt: (item) => dateOrEpoch(item.createdAt),
	completedAt: (item) => dateOrEpoch(item.completedAt),
	daysWaiting: (item) => item.daysWaiting,
	reportStatus: (item) => item.reportStatus ?? "",
};

function dateOrEpoch(value: string | null): Date {
	if (!value) {
		return new Date(0);
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function formatTableDate(value: string | null): string {
	if (!value) {
		return "N/A";
	}

	return format(new Date(value), "dd MMM yyyy", { locale: es });
}

function SortIcon({ isActive, direction }: { isActive: boolean; direction: SortDirection }) {
	if (!isActive || direction === "none") {
		return <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />;
	}

	return direction === "asc" ? (
		<ArrowUp className="h-3.5 w-3.5 text-[var(--color-brand-blue)]" />
	) : (
		<ArrowDown className="h-3.5 w-3.5 text-[var(--color-brand-blue)]" />
	);
}

function SortableHeader({
	label,
	column,
	sortKey,
	sortDirection,
	onSort,
}: {
	label: string;
	column: SortKey;
	sortKey: SortKey;
	sortDirection: SortDirection;
	onSort: (key: SortKey) => void;
}) {
	const isActive = sortKey === column;

	return (
		<th className="px-4 py-3 text-left">
			<button
				type="button"
				onClick={() => onSort(column)}
				className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
			>
				{label}
				<SortIcon isActive={isActive} direction={sortDirection} />
			</button>
		</th>
	);
}

export function ReportsDataTable() {
	const { data, isLoading } = useReportPipeline();
	const pipeline = data?.pipeline ?? [];
	const [page, setPage] = useState(1);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);

	const { sortedData, sortKey, sortDirection, toggleSort } = useTableSort<
		ReportPipelineItem,
		SortKey
	>({
		data: pipeline,
		initialSortKey: "daysWaiting",
		accessors: SORT_ACCESSORS,
	});

	const pageRows = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return sortedData.slice(start, start + PAGE_SIZE);
	}, [page, sortedData]);

	const averageWaitingDays =
		sortedData.length > 0
			? sortedData.reduce((sum, item) => sum + item.daysWaiting, 0) / sortedData.length
			: 0;

	const handleRowClick = (orderId: string) => {
		setSelectedOrderId(orderId);
		setDetailOpen(true);
	};

	if (isLoading) {
		return (
			<section className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-blue)] border-t-transparent" />
			</section>
		);
	}

	if (sortedData.length === 0) {
		return (
			<section className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] py-16 text-center">
				<Inbox className="h-10 w-10 text-[var(--text-tertiary)]" aria-hidden="true" />
				<p className="text-sm text-[var(--text-secondary)]">No hay informes para mostrar.</p>
			</section>
		);
	}

	return (
		<>
			<section
				aria-labelledby="reports-data-table-title"
				className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
			>
				<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2
							id="reports-data-table-title"
							className="text-lg font-bold text-[var(--text-primary)]"
						>
							Tabla analítica
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">
							Ordena, revisa detalles y exporta la bandeja operativa.
						</p>
					</div>
					<ExportMenu items={sortedData} />
				</header>

				<div className="overflow-x-auto">
					<table className="w-full min-w-[980px] text-sm">
						<thead className="border-y border-[var(--border-default)] bg-[var(--surface-secondary)]">
							<tr>
								<SortableHeader
									label="Código"
									column="code"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Activo"
									column="assetName"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Técnico"
									column="createdBy"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Estado OT"
									column="status"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Creada"
									column="createdAt"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Completada"
									column="completedAt"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Días ciclo"
									column="daysWaiting"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<SortableHeader
									label="Reporte"
									column="reportStatus"
									sortKey={sortKey}
									sortDirection={sortDirection}
									onSort={toggleSort}
								/>
								<th className="px-4 py-3 text-right text-xs font-bold uppercase text-[var(--text-secondary)]">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-default)]">
							{pageRows.map((item) => (
								<tr
									key={item._id}
									className="transition-colors hover:bg-[var(--surface-secondary)]"
								>
									<td className="px-4 py-3">
										<button
											type="button"
											onClick={() => handleRowClick(item._id)}
											className="font-mono font-bold text-[var(--color-brand-blue)] hover:underline"
										>
											{item.code}
										</button>
									</td>
									<td className="px-4 py-3">
										<p className="max-w-56 truncate font-medium text-[var(--text-primary)]">
											{item.assetName}
										</p>
										<p className="max-w-56 truncate text-xs text-[var(--text-secondary)]">
											{item.location}
										</p>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{item.createdBy}</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{item.status}</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">
										{formatTableDate(item.createdAt)}
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">
										{formatTableDate(item.completedAt)}
									</td>
									<td className="px-4 py-3">
										<span
											className={
												item.daysWaiting > 5
													? "font-bold text-[var(--color-danger)]"
													: item.daysWaiting > 2
														? "font-bold text-[var(--color-warning)]"
														: "font-bold text-[var(--color-success)]"
											}
										>
											{item.daysWaiting}d
										</span>
									</td>
									<td className="px-4 py-3">
										{item.reportStatus ? (
											<ReportStatusBadge status={item.reportStatus} />
										) : (
											<span className="text-xs text-[var(--text-tertiary)]">Sin informe</span>
										)}
									</td>
									<td className="px-4 py-3 text-right">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => handleRowClick(item._id)}
										>
											<Eye className="h-4 w-4" aria-hidden="true" />
											Detalle
										</Button>
									</td>
								</tr>
							))}
						</tbody>
						<tfoot className="border-t border-[var(--border-default)] bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-secondary)]">
							<tr>
								<td colSpan={6} className="px-4 py-3 text-right">
									Total: {sortedData.length} informes
								</td>
								<td className="px-4 py-3">{averageWaitingDays.toFixed(1)}d prom.</td>
								<td colSpan={2} className="px-4 py-3" />
							</tr>
						</tfoot>
					</table>
				</div>

				<Pagination
					page={page}
					limit={PAGE_SIZE}
					total={sortedData.length}
					onPageChange={setPage}
				/>
			</section>

			<ReportDetailSheet orderId={selectedOrderId} open={detailOpen} onOpenChange={setDetailOpen} />
		</>
	);
}
