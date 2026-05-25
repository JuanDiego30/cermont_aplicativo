"use client";

import { Download, FileText } from "lucide-react";
import Link from "next/link";
import { toApiUrl } from "@/lib/http/api-client";
import { formatDate } from "@/lib/utils/format-date";
import { useReports } from "@/modules/reports/queries";

const REPORT_TYPE_LABELS: Record<string, string> = {
	ejecucion: "Ejecución",
	entrega: "Entrega",
	cierre: "Cierre",
	tecnico: "Técnico",
	financiero: "Financiero",
};

const REPORT_TYPE_COLORS: Record<string, string> = {
	ejecucion: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	entrega:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	cierre:
		"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
	tecnico:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
	financiero:
		"bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[color:var(--color-purple)]/15",
};

function reportValue(report: object, key: string): unknown {
	return (report as Record<string, unknown>)[key];
}

function reportString(report: object, ...keys: string[]): string {
	for (const key of keys) {
		const value = reportValue(report, key);
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	return "";
}

function reportWorkOrderLabel(report: object): string {
	const workOrder = reportValue(report, "workOrder");
	if (workOrder && typeof workOrder === "object" && "numero_ot" in workOrder) {
		const value = (workOrder as { numero_ot?: unknown }).numero_ot;
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	return reportString(report, "workOrderId", "work_order_id") || ",";
}

function reportClientName(report: object): string {
	const workOrder = reportValue(report, "workOrder");
	if (workOrder && typeof workOrder === "object" && "cliente" in workOrder) {
		const value = (workOrder as { cliente?: unknown }).cliente;
		if (typeof value === "string") {
			return value;
		}
	}
	return reportString(report, "clientName");
}

function ReportTableRow({ report }: { report: object }) {
	const reportId = reportString(report, "_id", "id");
	const title = reportString(report, "titulo", "title");
	const type = reportString(report, "tipo", "type");
	const workOrderId = reportString(report, "workOrderId", "work_order_id");
	const createdAt = reportString(report, "createdAt", "created_at");
	const pdfUrl = reportString(report, "pdfUrl", "pdf_url");

	return (
		<tr className="group transition-colors hover:bg-[var(--surface-secondary)]/60">
			<td className="px-5 py-3.5">
				<Link
					href={`/reports/${reportId}`}
					className="flex items-center gap-2 font-medium text-[var(--color-brand-blue)] hover:underline"
				>
					<FileText aria-hidden="true" className="size-4 shrink-0" />
					<span className="max-w-[200px] truncate">{title}</span>
				</Link>
			</td>
			<td className="px-5 py-3.5">
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${REPORT_TYPE_COLORS[type] ?? "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20"}`}
				>
					{REPORT_TYPE_LABELS[type] ?? type}
				</span>
			</td>
			<td className="px-5 py-3.5">
				<Link
					href={`/orders/${workOrderId}`}
					className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--color-brand-blue)] hover:underline"
				>
					{reportWorkOrderLabel(report)}
				</Link>
				<p className="mt-0.5 max-w-[150px] truncate text-xs text-[var(--text-tertiary)]">
					{reportClientName(report)}
				</p>
			</td>
			<td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
				{createdAt ? formatDate(createdAt, "dd MMM yyyy") : ","}
			</td>
			<td className="px-5 py-3.5">
				{pdfUrl ? (
					<a
						href={pdfUrl || toApiUrl(`/reports/${reportId}/pdf`)}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)] hover:underline"
					>
						<Download aria-hidden="true" className="size-3.5" />
						Descargar
					</a>
				) : (
					<span className="text-xs text-[var(--text-tertiary)]">,</span>
				)}
			</td>
			<td className="px-5 py-3.5">
				<Link
					href={`/reports/${reportId}`}
					aria-label={`Ver informe ${title}`}
					className="text-xs font-medium text-[var(--color-brand-blue)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:underline"
				>
					Ver →
				</Link>
			</td>
		</tr>
	);
}

export default function ReportsPage() {
	const { data, isLoading, isError } = useReports({ limit: 100 });
	const reports = data || [];
	const total = 0;

	return (
		<section className="space-y-6" aria-labelledby="reports-page-title">
			<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] p-5 sm:px-6">
					<p className="text-sm text-[var(--text-secondary)]">Dashboard / Informes</p>
					<div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<h1
								id="reports-page-title"
								className="text-2xl font-semibold text-[var(--text-primary)]"
							>
								Informes Técnicos
							</h1>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								{isLoading ? "Cargando…" : `${total || reports.length} informes en total`}
							</p>
						</div>
					</div>
				</div>

				<div className="p-5 sm:px-6">
					<div className="grid gap-3 sm:grid-cols-3">
						{[
							{ label: "Informes", value: reports.length, tone: "text-[var(--color-brand-blue)]" },
							{
								label: "Con PDF",
								value: reports.filter((report) => reportString(report, "pdfUrl", "pdf_url")).length,
								tone: "text-[var(--color-success)]",
							},
							{
								label: "Tipos",
								value: Object.keys(REPORT_TYPE_LABELS).length,
								tone: "text-[var(--color-purple)]",
							},
						].map((card) => (
							<article
								key={card.label}
								className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
									{card.label}
								</p>
								<p className={`mt-2 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
							</article>
						))}
					</div>
				</div>
			</header>

			{/* Table */}
			{isLoading ? (
				<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-secondary)] shadow-[var(--shadow-2)]">
					Cargando informes…
				</div>
			) : isError ? (
				<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] text-sm text-[var(--color-danger)] shadow-[var(--shadow-2)]">
					Error al cargar informes
				</div>
			) : reports.length === 0 ? (
				<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-secondary)] shadow-[var(--shadow-2)]">
					No hay informes registrados
				</div>
			) : (
				<div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[700px] text-sm">
							<caption className="sr-only">
								Informes con tipo, orden relacionada, fecha, descarga en PDF y enlace al detalle.
							</caption>
							<thead>
								<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]/60 text-left">
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Título
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Tipo
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Orden de Trabajo
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Fecha
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										PDF
									</th>
									<th
										scope="col"
										className="px-5 py-3 font-medium text-[var(--text-secondary)] sr-only"
									>
										Ver
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[color:var(--border-default)]/60">
								{reports.map((report) => (
									<ReportTableRow key={reportString(report, "_id", "id")} report={report} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</section>
	);
}
