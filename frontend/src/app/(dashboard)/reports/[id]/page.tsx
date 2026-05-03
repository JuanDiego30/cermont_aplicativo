"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { apiClient, toApiUrl } from "@/_shared/lib/http/api-client";

const REPORT_TYPE_LABELS: Record<string, string> = {
	ejecucion: "Ejecución",
	entrega: "Entrega",
	cierre: "Cierre",
	tecnico: "Técnico",
	financiero: "Financiero",
};

function renderContent(content: unknown): React.ReactNode {
	if (content === null || content === undefined) {
		return null;
	}

	if (typeof content === "string") {
		return (
			<p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{content}</p>
		);
	}

	if (typeof content === "number" || typeof content === "boolean") {
		return <p className="text-sm text-slate-700 dark:text-slate-300">{String(content)}</p>;
	}

	if (Array.isArray(content)) {
		return (
			<ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
				{content.map((item, _index) => (
					<li
						key={typeof item === "object" ? JSON.stringify(item) : `${typeof item}:${String(item)}`}
						className="flex gap-2"
					>
						<span className="text-slate-400">•</span>
						<span>{typeof item === "object" ? JSON.stringify(item) : String(item)}</span>
					</li>
				))}
			</ul>
		);
	}

	if (typeof content === "object") {
		return (
			<dl className="space-y-3">
				{Object.entries(content as Record<string, unknown>).map(([key, value]) => (
					<div key={key}>
						<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							{key.replace(/_/g, " ")}
						</dt>
						<dd className="text-sm text-slate-700 dark:text-slate-300">{renderContent(value)}</dd>
					</div>
				))}
			</dl>
		);
	}

	return null;
}

interface ReportData {
	_id?: string;
	title?: string;
	type?: string;
	orderId?: string;
	workOrderId?: string;
	generatedBy?: string;
	createdAt?: string;
	summary?: unknown;
	content?: unknown;
	pdfUrl?: string;
	clientName?: string;
}

interface TransformedReport {
	_id: string;
	title: string;
	type: string;
	workOrderId: string;
	generatedBy: string;
	createdAt: string;
	content: unknown;
	pdfUrl: string;
	workOrderNumber: string;
	clientName: string;
}

export default function ReportDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: report,
		isLoading,
		error,
	} = useQuery<TransformedReport>({
		queryKey: ["report", id],
		queryFn: async () => {
			const body = await apiClient.get<{
				success?: boolean;
				data?: ReportData;
				error?: string;
				message?: string;
			}>(`/reports/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar reporte");
			}
			const r = body.data;
			if (!r) {
				throw new Error("Reporte no encontrado");
			}

			return {
				_id: String(r._id ?? ""),
				title: r.title ?? "Sin título",
				type: r.type ?? "technical",
				workOrderId: r.orderId ?? r.workOrderId ?? "",
				generatedBy: r.generatedBy ?? "—",
				createdAt: r.createdAt ?? "",
				content: r.summary ?? r.content ?? {},
				pdfUrl: r.pdfUrl ?? "",
				workOrderNumber: "",
				clientName: r.clientName ?? "",
			};
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800">
				<span className="text-slate-500">Cargando detalles de informe...</span>
			</div>
		);
	}

	if (error || !report) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
				No se pudo cargar el informe. {(error as Error)?.message}
			</div>
		);
	}

	const reportTypeLabel = REPORT_TYPE_LABELS[report.type] ?? report.type;

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="report-detail-title">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Link
						href="/reports"
						className="mt-1 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Volver
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<FileText aria-hidden="true" className="h-6 w-6 text-blue-600 dark:text-blue-500" />
							<h1
								id="report-detail-title"
								className="text-2xl font-bold text-slate-900 dark:text-white"
							>
								{report.title}
							</h1>
						</div>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							{reportTypeLabel} ·{" "}
							<Link
								href={`/orders/${report.workOrderId}`}
								className="font-mono text-blue-600 hover:underline dark:text-blue-400"
							>
								{report.workOrderNumber || report.workOrderId}
							</Link>{" "}
							— {report.clientName}
						</p>
					</div>
				</div>
				<a
					href={report.pdfUrl || toApiUrl(`/reports/${report._id}/pdf`)}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
				>
					<Download aria-hidden="true" className="h-4 w-4" />
					Descargar PDF
				</a>
			</div>

			{/* Metadata Card */}
			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
					Información del Informe
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Tipo</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{reportTypeLabel}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Orden de Trabajo</dt>
						<dd className="mt-1">
							<Link
								href={`/orders/${report.workOrderId}`}
								className="font-mono text-blue-600 hover:underline dark:text-blue-400"
							>
								{report.workOrderNumber || report.workOrderId}
							</Link>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Generado por</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{report.generatedBy}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Fecha de creación</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{report.createdAt
								? format(new Date(report.createdAt), "dd MMM yyyy HH:mm", {
										locale: es,
									})
								: "—"}
						</dd>
					</div>
				</dl>
			</div>

			{/* Content Card */}
			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
					Contenido
				</h2>
				{renderContent(report.content)}
			</div>
		</section>
	);
}
