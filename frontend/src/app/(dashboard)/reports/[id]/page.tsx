"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { apiClient, toApiUrl } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/utils/format-date";

const REPORT_TYPE_LABELS: Record<string, string> = {
	ejecucion: "Ejecución",
	entrega: "Entrega",
	cierre: "Cierre",
	tecnico: "Técnico",
	financiero: "Financiero",
};

function ReportContent({ content }: { content: unknown }): React.ReactNode {
	if (content === null || content === undefined) {
		return null;
	}

	if (typeof content === "string") {
		return <p className="text-sm text-charcoal dark:text-stone whitespace-pre-wrap">{content}</p>;
	}

	if (typeof content === "number" || typeof content === "boolean") {
		return <p className="text-sm text-charcoal dark:text-stone">{String(content)}</p>;
	}

	if (Array.isArray(content)) {
		return (
			<ul className="space-y-1 text-sm text-charcoal dark:text-stone">
				{content.map((item) => (
					<li
						key={typeof item === "object" ? JSON.stringify(item) : `${typeof item}:${String(item)}`}
						className="flex gap-2"
					>
						<span className="text-steel">•</span>
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
						<dt className="text-xs font-semibold uppercase tracking-wider text-steel">
							{key.replace(/_/g, " ")}
						</dt>
						<dd className="text-sm text-charcoal dark:text-stone">
							<ReportContent content={value} />
						</dd>
					</div>
				))}
			</dl>
		);
	}

	return null;
}

interface ReportDetail {
	_id: string;
	titulo: string;
	tipo: string;
	work_order_id: string;
	generado_por: string;
	created_at: string;
	contenido: unknown;
	pdf_url: string;
	work_orders: {
		numero_ot: string;
		cliente: string;
	};
}

export default function ReportDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: report,
		isLoading,
		error,
	} = useQuery<ReportDetail>({
		queryKey: ["report", id],
		queryFn: async () => {
			const body = await apiClient.get<{
				success?: boolean;
				data?: Record<string, unknown>;
				error?: string;
				message?: string;
			}>(`/reports/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar reporte");
			}
			const r = body.data ?? {};
			return {
				_id: String(r._id ?? ""),
				titulo: String(r.title ?? r.titulo ?? ""),
				tipo: String(r.type ?? r.tipo ?? "technical"),
				work_order_id: String(r.orderId ?? r.workOrderId ?? r.work_order_id ?? ""),
				generado_por: String(r.generatedBy ?? r.generado_por ?? ""),
				created_at: String(r.createdAt ?? r.created_at ?? ""),
				contenido: r.summary ?? r.content ?? r.contenido ?? {},
				pdf_url: String(r.pdfUrl ?? r.pdf_url ?? ""),
				work_orders: {
					numero_ot: String(r.orderId ?? r.workOrderId ?? ""),
					cliente: String(r.clientName ?? ""),
				},
			};
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
				<span className="text-steel">Cargando detalles de informe…</span>
			</div>
		);
	}

	if (error || !report) {
		return (
			<div className="p-4 bg-red-50 text-brand-error rounded-lg dark:bg-red-900/20 dark:text-brand-error">
				No se pudo cargar el informe. {(error as Error)?.message}
			</div>
		);
	}

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="report-detail-title">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Link
						href="/reports"
						className="mt-1 flex items-center gap-1 text-sm text-steel hover:text-charcoal dark:text-steel dark:hover:text-stone"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<FileText
								aria-hidden="true"
								className="size-6 text-brand-green dark:text-brand-green"
							/>
							<h1
								id="report-detail-title"
								className="text-2xl font-semibold text-ink dark:text-white"
							>
								{report.titulo}
							</h1>
						</div>
						<p className="mt-1 text-sm text-steel dark:text-steel">
							{REPORT_TYPE_LABELS[report.tipo] ?? report.tipo} ·{" "}
							<Link
								href={`/orders/${report.work_order_id}`}
								className="font-mono text-brand-green hover:underline dark:text-brand-green"
							>
								{report.work_orders?.numero_ot || report.work_order_id}
							</Link>{" "}
							, {report.work_orders?.cliente}
						</p>
					</div>
				</div>
				<a
					href={report.pdf_url || toApiUrl(`/reports/${report._id}/pdf`)}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-charcoal dark:text-stone shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
				>
					<Download aria-hidden="true" className="size-4" />
					Descargar PDF
				</a>
			</div>

			{/* Metadata Card */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel">
					Información del Informe
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-steel dark:text-steel">Tipo</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{REPORT_TYPE_LABELS[report.tipo] ?? report.tipo}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Orden de Trabajo</dt>
						<dd className="mt-1">
							<Link
								href={`/orders/${report.work_order_id}`}
								className="font-mono text-brand-green hover:underline dark:text-brand-green"
							>
								{report.work_orders?.numero_ot || report.work_order_id}
							</Link>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Generado por</dt>
						<dd className="mt-1 text-ink dark:text-white">{report.generado_por ?? ","}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Fecha de creación</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{report.created_at ? formatDateTime(report.created_at) : ","}
						</dd>
					</div>
				</dl>
			</div>

			{/* Content Card */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel">
					Contenido
				</h2>
				<ReportContent content={report.contenido} />
			</div>
		</section>
	);
}
