import type { DashboardSummary } from "@cermont/shared-types";
import {
	AlertTriangle,
	ArrowRight,
	BadgeCheck,
	BriefcaseBusiness,
	ClipboardCheck,
	Clock,
	CloudOff,
	FileCheck2,
	FileClock,
	MapPinCheck,
	ReceiptText,
	ShieldAlert,
	Timer,
	WalletCards,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";
import { SlaRiskOrdersTable } from "./SlaRiskOrdersTable";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCop(value: number): string {
	return COP_FORMATTER.format(value);
}

function priorityCardClass(span: string, tone: "brand" | "danger" | "neutral") {
	const border =
		tone === "brand"
			? "border-[var(--color-brand-blue)]"
			: tone === "danger"
				? "border-[var(--color-danger)]"
				: "border-[var(--border-medium)]";
	return `${span} rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] p-5 ${border}`;
}

export function DashboardCommandCenter({ summary }: { summary: DashboardSummary }) {
	const readiness = summary.fieldReadiness;
	const closure = summary.administrativeClosure;
	const criticalControls = readiness.blockingChecklistsPending + readiness.blockingChecklistsFailed;
	const closureBacklog =
		closure.pendingDeliveryRecords +
		closure.pendingSES +
		closure.pendingInvoices +
		closure.pendingPayments;
	const maximumDemand = Math.max(...summary.serviceDemand.items.map((item) => item.requests), 1);

	return (
		<div className="space-y-10">
			<section aria-labelledby="dashboard-priorities-title" className="space-y-4">
				<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-sm font-medium text-[var(--color-brand-blue)]">Prioridades de hoy</p>
						<h2
							id="dashboard-priorities-title"
							className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
						>
							Lo que puede detener la operación o el cobro
						</h2>
					</div>
					<time className="text-sm text-[var(--text-tertiary)]" dateTime={summary.generatedAt}>
						Actualizado {new Date(summary.generatedAt).toLocaleString("es-CO")}
					</time>
				</div>

				<div className="grid gap-4 lg:grid-cols-12">
					<Link
						href={APP_ROUTES.checklists}
						className={priorityCardClass("lg:col-span-5", "danger")}
					>
						<div className="flex items-start justify-between gap-5">
							<div className="space-y-3">
								<span className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
									<ShieldAlert className="size-5" aria-hidden="true" />
								</span>
								<div>
									<p className="text-sm font-medium text-[var(--text-secondary)]">
										Controles críticos por resolver
									</p>
									<p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-[var(--text-primary)]">
										{criticalControls}
									</p>
								</div>
								<p className="text-sm text-[var(--text-secondary)]">
									{readiness.blockingChecklistsFailed} fallidos ·{" "}
									{readiness.blockingChecklistsPending} pendientes
								</p>
							</div>
							<ArrowRight className="size-5 text-[var(--text-tertiary)]" aria-hidden="true" />
						</div>
					</Link>

					<Link href={APP_ROUTES.evidences} className={priorityCardClass("lg:col-span-3", "brand")}>
						<FileCheck2 className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
						<p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">
							Evidencias por validar
						</p>
						<p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
							{readiness.evidencePendingReview}
						</p>
						<p className="mt-2 text-xs text-[var(--text-tertiary)]">
							{readiness.evidenceRejected} rechazadas requieren reemplazo
						</p>
					</Link>

					<Link
						href={APP_ROUTES.deliveryRecords}
						className={priorityCardClass("lg:col-span-2", "neutral")}
					>
						<FileClock className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
						<p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">
							Expedientes por cerrar
						</p>
						<p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
							{closureBacklog}
						</p>
					</Link>

					<Link
						href={APP_ROUTES.payments}
						className={priorityCardClass("lg:col-span-2", "neutral")}
					>
						<WalletCards className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
						<p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">Cartera vencida</p>
						<p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[var(--text-primary)]">
							{formatCop(summary.financialAging.totalOverdueAmount)}
						</p>
						<p className="mt-2 text-xs text-[var(--text-tertiary)]">
							{summary.financialAging.overdueInvoiceCount} facturas
						</p>
					</Link>
				</div>
			</section>

			<SlaRiskOrdersTable orders={summary.slaRiskOrders ?? []} />

			<section aria-labelledby="pipeline-title" className="space-y-4">
				<div>
					<p className="text-sm font-medium text-[var(--color-brand-blue)]">Flujo documental</p>
					<h2 id="pipeline-title" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
						Casos distribuidos en el ciclo solicitud → pago
					</h2>
				</div>
				<div className="overflow-x-auto pb-2">
					<ol className="grid min-w-[920px] grid-flow-col auto-cols-[minmax(8rem,1fr)] gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
						{summary.operationalPipeline.stages.map((stage) => (
							<li key={stage.stage} className="bg-[var(--surface-primary)] p-4">
								<p className="font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
									{stage.count}
								</p>
								<p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{stage.label}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
				<section
					aria-labelledby="field-readiness-title"
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6"
				>
					<div className="flex items-start gap-3">
						<ClipboardCheck
							className="mt-0.5 size-5 text-[var(--color-brand-blue)]"
							aria-hidden="true"
						/>
						<div>
							<h2
								id="field-readiness-title"
								className="text-lg font-semibold text-[var(--text-primary)]"
							>
								Preparación de campo
							</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								Seguridad, soportes y disponibilidad antes de ejecutar.
							</p>
						</div>
					</div>

					<dl className="mt-6 divide-y divide-[var(--border-subtle)]">
						<ReadinessRow
							icon={MapPinCheck}
							label="Evidencias con geolocalización"
							value={`${readiness.evidenceGpsCoveragePct}%`}
						/>
						<ReadinessRow
							icon={BadgeCheck}
							label="Certificados próximos a vencer"
							value={String(
								readiness.vehicleDocumentsExpiring + readiness.toolCertificationsExpiring,
							)}
						/>
						<ReadinessRow
							icon={AlertTriangle}
							label="Certificados vencidos"
							value={String(
								readiness.vehicleDocumentsExpired + readiness.toolCertificationsExpired,
							)}
						/>
						<ReadinessRow
							icon={CloudOff}
							label="Sincronizaciones pendientes / fallidas"
							value={`${readiness.offlineSyncPending} / ${readiness.offlineSyncFailed}`}
						/>
					</dl>
				</section>

				<section
					aria-labelledby="service-demand-title"
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6"
				>
					<BriefcaseBusiness className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2
						id="service-demand-title"
						className="mt-3 text-lg font-semibold text-[var(--text-primary)]"
					>
						Demanda de servicios · últimos {summary.serviceDemand.periodDays} días
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{summary.serviceDemand.totalRequests} solicitudes recibidas
					</p>

					{summary.serviceDemand.items.length > 0 ? (
						<ul className="mt-6 space-y-4">
							{summary.serviceDemand.items.map((item) => (
								<li key={item.serviceType} className="space-y-2">
									<div className="flex items-center justify-between gap-4 text-sm">
										<span className="text-[var(--text-secondary)]">{item.serviceType}</span>
										<span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
											{item.requests}
										</span>
									</div>
									<progress
										value={item.requests}
										max={maximumDemand}
										className="h-2 w-full overflow-hidden rounded-full accent-[var(--color-brand-blue)]"
										aria-label={`${item.serviceType}: ${item.requests} solicitudes`}
									/>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-6 rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--text-secondary)]">
							Sin solicitudes registradas en este período.
						</p>
					)}
				</section>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6">
					<ReceiptText className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
						Cierre administrativo
					</h2>
					<dl className="mt-5 grid grid-cols-2 gap-4">
						<CompactMetric label="Actas pendientes" value={closure.pendingDeliveryRecords} />
						<CompactMetric label="SES pendientes" value={closure.pendingSES} />
						<CompactMetric label="Facturas pendientes" value={closure.pendingInvoices} />
						<CompactMetric label="Pagos pendientes" value={closure.pendingPayments} />
					</dl>
				</section>

				<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6">
					<FileCheck2 className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
						Carga documental
					</h2>
					<dl className="mt-5 grid grid-cols-2 gap-4">
						<CompactMetric
							label="Importaciones procesando"
							value={summary.documentWorkload.pendingImports}
						/>
						<CompactMetric
							label="Plantillas por publicar"
							value={summary.documentWorkload.pendingTemplates}
						/>
						<CompactMetric
							label="Respuestas por validar"
							value={summary.documentWorkload.pendingResponses}
						/>
						<CompactMetric
							label="Documentos gestionados"
							value={summary.documentWorkload.totalDocuments}
						/>
					</dl>
				</section>
			</div>

			{summary.maintenanceEfficiency && (
				<div className="grid gap-6 lg:grid-cols-2">
					<section
						aria-labelledby="mttr-title"
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6"
					>
						<div className="flex items-start gap-3">
							<Timer className="mt-0.5 size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
							<div>
								<h2 id="mttr-title" className="text-lg font-semibold text-[var(--text-primary)]">
									MTTR — Tiempo medio de reparación
								</h2>
								<p className="mt-1 text-sm text-[var(--text-secondary)]">
									Promedio de horas desde inicio a finalización de ejecuciones.
								</p>
							</div>
						</div>
						<dl className="mt-5 grid grid-cols-2 gap-4">
							<CompactMetric label="MTTR (horas)" value={summary.maintenanceEfficiency.mttrHours} />
							<CompactMetric label="MTBF (días)" value={summary.maintenanceEfficiency.mtbfDays} />
							<CompactMetric
								label="Tasa de finalización"
								value={summary.maintenanceEfficiency.maintenanceCompletionRate}
							/>
							<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4">
								<dt className="flex items-center gap-1 text-xs leading-5 text-[var(--text-secondary)]">
									<Wrench className="size-3" aria-hidden="true" />
									Órdenes activas / vencidas
								</dt>
								<dd className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
									{summary.maintenanceEfficiency.activeWorkOrders} /{" "}
									{summary.maintenanceEfficiency.overdueWorkOrders}
								</dd>
							</div>
						</dl>
					</section>

					<section
						aria-labelledby="clock-title"
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6"
					>
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
							<div>
								<h2 id="clock-title" className="text-lg font-semibold text-[var(--text-primary)]">
									Envejecimiento de cartera
								</h2>
								<p className="mt-1 text-sm text-[var(--text-secondary)]">
									Distribución de facturas pendientes por antigüedad.
								</p>
							</div>
						</div>

						{summary.financialAging.buckets.length > 0 ? (
							<dl className="mt-5 divide-y divide-[var(--border-subtle)]">
								{summary.financialAging.buckets.map((bucket) => (
									<div
										key={bucket.bucket}
										className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
									>
										<dt className="text-sm text-[var(--text-secondary)]">{bucket.bucket}</dt>
										<dd className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
											{formatCop(bucket.amount)} ({bucket.count})
										</dd>
									</div>
								))}
							</dl>
						) : (
							<p className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--text-secondary)]">
								Sin desglose de cartera disponible.
							</p>
						)}
					</section>
				</div>
			)}
		</div>
	);
}

function ReadinessRow({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof MapPinCheck;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
			<dt className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
				<Icon className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
				{label}
			</dt>
			<dd className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
				{value}
			</dd>
		</div>
	);
}

function CompactMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4">
			<dt className="text-xs leading-5 text-[var(--text-secondary)]">{label}</dt>
			<dd className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
				{value}
			</dd>
		</div>
	);
}
