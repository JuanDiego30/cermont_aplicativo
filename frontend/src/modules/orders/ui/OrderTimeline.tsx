"use client";

/**
 * OrderTimeline — Visual timeline of the 14 operational steps for a work order.
 *
 * Maps the order's current status to one of the 14 CERMONT steps and shows:
 * - Completed steps with a checkmark (green)
 * - Current step highlighted (blue, pulsing indicator)
 * - Pending steps (gray)
 *
 * Reference: ServiceMax lifecycle view, Jobber job timeline
 */

import { CheckCircle2, Circle, Clock, Loader } from "lucide-react";

// ─── Step definitions ─────────────────────────────────────────────────────────

type Phase = "operational" | "administrative";

interface Step {
	number: number;
	label: string;
	description: string;
	phase: Phase;
}

const STEPS: Step[] = [
	{
		number: 1,
		label: "Solicitud de servicio",
		description: "Registrar y validar la necesidad del cliente.",
		phase: "operational",
	},
	{
		number: 2,
		label: "Visita de sitio",
		description: "Inspección técnica preliminar en sitio.",
		phase: "operational",
	},
	{
		number: 3,
		label: "Propuesta técnica",
		description: "Elaborar y enviar cotización técnica-económica.",
		phase: "operational",
	},
	{
		number: 4,
		label: "Orden de compra",
		description: "Aprobación de la orden de compra por el cliente.",
		phase: "operational",
	},
	{
		number: 5,
		label: "Planeación",
		description: "Planificar recursos, equipo y cronograma.",
		phase: "operational",
	},
	{
		number: 6,
		label: "Ejecución",
		description: "Trabajo en campo con registro de actividades.",
		phase: "operational",
	},
	{
		number: 7,
		label: "Informe técnico",
		description: "Elaborar informe de las actividades ejecutadas.",
		phase: "operational",
	},
	{
		number: 8,
		label: "Acta de entrega",
		description: "Formalizar la entrega del trabajo al cliente.",
		phase: "operational",
	},
	{
		number: 9,
		label: "Firma del cliente",
		description: "Obtener firma de conformidad del cliente.",
		phase: "operational",
	},
	{
		number: 10,
		label: "SES / Ariba",
		description: "Radicar Hoja de Entrada de Servicio en SAP.",
		phase: "administrative",
	},
	{
		number: 11,
		label: "Aprobación SES",
		description: "Esperar aprobación del SES por el cliente.",
		phase: "administrative",
	},
	{
		number: 12,
		label: "Factura",
		description: "Emitir y radicar la factura electrónica.",
		phase: "administrative",
	},
	{
		number: 13,
		label: "Aprobación factura",
		description: "Confirmar aprobación de la factura por el cliente.",
		phase: "administrative",
	},
	{
		number: 14,
		label: "Pago y cierre",
		description: "Registrar el pago recibido y cerrar la orden.",
		phase: "administrative",
	},
];

// ─── Status → Step mapping ────────────────────────────────────────────────────

const STATUS_TO_STEP: Record<string, number> = {
	open: 1,
	proposal_sent: 3,
	proposal_approved: 4,
	planning: 5,
	assigned: 5,
	ready_for_execution: 6,
	in_progress: 6,
	execution_in_progress: 6,
	execution_completed: 7,
	report_pending: 7,
	completed: 8,
	acta_signed: 9,
	ses_sent: 10,
	ready_for_invoicing: 11,
	invoice_approved: 13,
	paid: 14,
	closed: 14,
	on_hold: 5, // paused — show current step as "on hold"
	cancelled: 0, // special case
};

function getStepForStatus(status: string): number {
	return STATUS_TO_STEP[status] ?? 1;
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

interface StepRowProps {
	step: Step;
	status: "completed" | "current" | "pending";
	isCancelled: boolean;
	isOnHold: boolean;
}

function StepRow({ step, status, isCancelled, isOnHold }: StepRowProps) {
	const isCompleted = status === "completed";
	const isCurrent = status === "current";

	return (
		<li className="flex gap-3">
			{/* Timeline spine */}
			<div className="flex flex-col items-center">
				{/* Icon */}
				<div
					className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
						isCompleted
							? "border-[var(--color-success)] bg-[var(--color-success)]"
							: isCurrent
								? isCancelled
									? "border-[var(--color-danger)] bg-[var(--color-danger-bg)]"
									: isOnHold
										? "border-[var(--color-warning)] bg-[var(--color-warning-bg)]"
										: "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/10"
								: "border-[var(--border-subtle)] bg-[var(--surface-secondary)]"
					}`}
				>
					{isCompleted ? (
						<CheckCircle2 className="size-4 text-white" aria-hidden="true" />
					) : isCurrent ? (
						isCancelled ? (
							<Circle className="size-3.5 text-[var(--color-danger)]" aria-hidden="true" />
						) : isOnHold ? (
							<Clock className="size-3.5 text-[var(--color-warning)]" aria-hidden="true" />
						) : (
							<Loader
								className="size-3.5 animate-spin text-[var(--color-brand-blue)]"
								aria-hidden="true"
							/>
						)
					) : (
						<span className="text-[9px] font-bold text-[var(--text-tertiary)]">{step.number}</span>
					)}
				</div>

				{/* Connector line */}
				{step.number < 14 && (
					<div
						className={`mt-1 w-0.5 flex-1 rounded-full ${
							isCompleted ? "bg-[var(--color-success)]/40" : "bg-[var(--border-subtle)]"
						}`}
						style={{ minHeight: "20px" }}
						aria-hidden="true"
					/>
				)}
			</div>

			{/* Content */}
			<div className={`pb-4 ${step.number === 14 ? "pb-0" : ""}`}>
				{/* Phase separator */}
				{step.number === 10 && (
					<div className="mb-2 mt-1 flex items-center gap-2">
						<div className="h-px flex-1 bg-[var(--border-subtle)]" />
						<span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
							Fase administrativa
						</span>
						<div className="h-px flex-1 bg-[var(--border-subtle)]" />
					</div>
				)}

				<div className="flex items-center gap-2">
					<p
						className={`text-sm font-medium ${
							isCompleted
								? "text-[var(--color-success)]"
								: isCurrent
									? isCancelled
										? "text-[var(--color-danger)]"
										: isOnHold
											? "text-[var(--color-warning)]"
											: "text-[var(--color-brand-blue)]"
									: "text-[var(--text-tertiary)]"
						}`}
					>
						{step.label}
					</p>
					{isCurrent && !isCancelled && !isOnHold && (
						<span className="rounded-full bg-[var(--color-brand-blue)]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-brand-blue)]">
							Actual
						</span>
					)}
					{isCurrent && isOnHold && (
						<span className="rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-warning)]">
							En pausa
						</span>
					)}
				</div>
				<p
					className={`mt-0.5 text-xs leading-relaxed ${
						isCurrent && !isCancelled
							? "text-[var(--text-secondary)]"
							: "text-[var(--text-tertiary)]"
					}`}
				>
					{step.description}
				</p>
			</div>
		</li>
	);
}

// ─── OrderTimeline ────────────────────────────────────────────────────────────

interface OrderTimelineProps {
	status: string;
	createdAt?: string;
}

export function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
	const isCancelled = status === "cancelled";
	const isOnHold = status === "on_hold";
	const currentStepNumber = isCancelled ? 0 : getStepForStatus(status);

	const completedCount = isCancelled ? 0 : currentStepNumber - 1;

	return (
		<aside
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
			aria-label="Progreso de la orden"
		>
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-[var(--text-primary)]">Progreso del servicio</h2>
				{!isCancelled && (
					<span className="text-xs text-[var(--text-tertiary)]">{completedCount} de 14 pasos</span>
				)}
				{isCancelled && (
					<span className="rounded-full bg-[var(--color-danger-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-danger)]">
						Cancelada
					</span>
				)}
			</div>

			{/* Progress bar */}
			{!isCancelled && (
				<div className="mb-5">
					<progress
						className="sr-only"
						value={completedCount}
						max={14}
						aria-label="Order completion progress"
					/>
					<div
						className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]"
						aria-hidden="true"
					>
						<div
							className="h-full rounded-full bg-[var(--color-brand-blue)] transition-all duration-500"
							style={{ width: `${Math.max(5, (completedCount / 14) * 100)}%` }}
						/>
					</div>
					<p className="mt-1 text-right text-[10px] text-[var(--text-tertiary)]">
						{Math.round((completedCount / 14) * 100)}% completado
					</p>
				</div>
			)}

			{/* Steps */}
			<ol className="space-y-0" aria-label="Pasos del servicio">
				{STEPS.map((step) => {
					let rowStatus: "completed" | "current" | "pending";
					if (isCancelled) {
						rowStatus = "pending";
					} else if (step.number < currentStepNumber) {
						rowStatus = "completed";
					} else if (step.number === currentStepNumber) {
						rowStatus = "current";
					} else {
						rowStatus = "pending";
					}

					return (
						<StepRow
							key={step.number}
							step={step}
							status={rowStatus}
							isCancelled={isCancelled}
							isOnHold={isOnHold}
						/>
					);
				})}
			</ol>

			{/* Footer */}
			{createdAt && (
				<p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-[10px] text-[var(--text-tertiary)]">
					Creada el{" "}
					{new Date(createdAt).toLocaleDateString("es-CO", {
						day: "2-digit",
						month: "long",
						year: "numeric",
						timeZone: "America/Bogota",
					})}
				</p>
			)}
		</aside>
	);
}
