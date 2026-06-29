"use client";

/**
 * VehicleDocumentsTab — Displays SOAT, Tecnomecánica, and Póliza
 * as professional status cards with a traffic-light color system.
 *
 * Green  = > 30 days remaining
 * Yellow = 1–30 days remaining
 * Red    = expired or missing
 */

import { AlertTriangle, CalendarClock, CheckCircle2, FileText, RefreshCcw } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

function useMounted(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

function daysUntil(isoDate: string): number {
	const now = new Date();
	const target = new Date(isoDate);
	return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── DocumentStatusCard ───────────────────────────────────────────────────────

interface DocumentStatusCardProps {
	label: string;
	icon?: React.ReactNode;
	expiryIso?: string;
	mounted: boolean;
}

function DocumentStatusCard({ label, icon, expiryIso, mounted }: DocumentStatusCardProps) {
	const info = useMemo(() => {
		if (!expiryIso) {
			return {
				days: null,
				status: "missing" as const,
				formattedDate: null,
			};
		}
		const days = mounted ? daysUntil(expiryIso) : null;
		const formattedDate = new Date(expiryIso).toLocaleDateString("es-CO", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
		let status: "ok" | "warning" | "expired" | "missing";
		if (days === null) {
			status = "ok";
		} else if (days < 0) {
			status = "expired";
		} else if (days <= 30) {
			status = "warning";
		} else {
			status = "ok";
		}
		return { days, status, formattedDate };
	}, [expiryIso, mounted]);

	const config = {
		ok: {
			border: "border-[var(--color-success-bg)]",
			bg: "bg-gradient-to-br from-[var(--color-success-bg)]/30 to-transparent",
			accent: "bg-[var(--color-success-bg)]",
			iconColor: "text-[var(--color-success)]",
			labelColor: "text-[var(--color-success)]",
			Icon: CheckCircle2,
			badge: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
			badgeText: info.days !== null ? `${info.days} días restantes` : "Vigente",
		},
		warning: {
			border: "border-[var(--color-warning-bg)]",
			bg: "bg-gradient-to-br from-[var(--color-warning-bg)]/40 to-transparent",
			accent: "bg-[var(--color-warning-bg)]",
			iconColor: "text-[var(--color-warning)]",
			labelColor: "text-[var(--color-warning)]",
			Icon: CalendarClock,
			badge: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
			badgeText:
				info.days !== null
					? `Vence en ${info.days} día${info.days !== 1 ? "s" : ""}`
					: "Próximo a vencer",
		},
		expired: {
			border: "border-[var(--color-danger-bg)]",
			bg: "bg-gradient-to-br from-[var(--color-danger-bg)]/40 to-transparent",
			accent: "bg-[var(--color-danger-bg)]",
			iconColor: "text-[var(--color-danger)]",
			labelColor: "text-[var(--color-danger)]",
			Icon: AlertTriangle,
			badge: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
			badgeText: "Vencido",
		},
		missing: {
			border: "border-[var(--border-subtle)]",
			bg: "bg-[var(--surface-secondary)]/30",
			accent: "bg-[var(--surface-secondary)]",
			iconColor: "text-[var(--text-tertiary)]",
			labelColor: "text-[var(--text-tertiary)]",
			Icon: FileText,
			badge: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)]",
			badgeText: "Sin registrar",
		},
	}[info.status];

	return (
		<article
			className={`relative overflow-hidden rounded-[var(--radius-xl)] border p-5 ${config.border} ${config.bg}`}
		>
			{/* Accent stripe */}
			<div className={`absolute inset-y-0 left-0 w-1 ${config.accent}`} aria-hidden="true" />

			<div className="pl-2">
				{/* Header row */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div
							className={`flex size-8 items-center justify-center rounded-full ${config.accent}`}
						>
							{icon ?? <config.Icon className={`size-4 ${config.iconColor}`} aria-hidden="true" />}
						</div>
						<h3 className={`text-sm font-semibold ${config.labelColor}`}>{label}</h3>
					</div>
					<span
						className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badge}`}
					>
						{config.badgeText}
					</span>
				</div>

				{/* Expiry date */}
				<div className="mt-3">
					{info.formattedDate ? (
						<>
							<p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
								Fecha de vencimiento
							</p>
							<p className={`mt-0.5 text-base font-semibold ${config.labelColor}`}>
								{info.formattedDate}
							</p>
						</>
					) : (
						<p className="text-sm text-[var(--text-tertiary)]">
							No se ha registrado la fecha de este documento.
						</p>
					)}
				</div>

				{/* Renewal reminder */}
				{info.status === "expired" && (
					<div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
						<RefreshCcw className="size-3" aria-hidden="true" />
						Renueva este documento para poder asignar conductor.
					</div>
				)}
				{info.status === "warning" && (
					<div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
						<CalendarClock className="size-3" aria-hidden="true" />
						Programa la renovación antes de la fecha de vencimiento.
					</div>
				)}
			</div>
		</article>
	);
}

// ─── VehicleDocumentsTab ──────────────────────────────────────────────────────

interface VehicleDocumentsTabProps {
	soatExpiry?: string;
	technoMechanicalExpiry?: string;
	insuranceExpiry?: string;
}

export function VehicleDocumentsTab({
	soatExpiry,
	technoMechanicalExpiry,
	insuranceExpiry,
}: VehicleDocumentsTabProps) {
	const mounted = useMounted();

	const expiredCount = [soatExpiry, technoMechanicalExpiry, insuranceExpiry].filter((d) => {
		if (!d || !mounted) {
			return false;
		}
		return daysUntil(d) < 0;
	}).length;

	return (
		<section className="space-y-4" aria-labelledby="vehicle-docs-heading">
			<div className="flex items-center justify-between">
				<h2 id="vehicle-docs-heading" className="text-sm font-semibold text-[var(--text-primary)]">
					Documentos del vehículo
				</h2>
				{expiredCount > 0 && (
					<span className="flex items-center gap-1 text-xs font-medium text-[var(--color-danger)]">
						<AlertTriangle className="size-3.5" aria-hidden="true" />
						{expiredCount} vencido{expiredCount > 1 ? "s" : ""}
					</span>
				)}
			</div>

			<div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
				<DocumentStatusCard label="SOAT" expiryIso={soatExpiry} mounted={mounted} />
				<DocumentStatusCard
					label="Tecnomecánica"
					expiryIso={technoMechanicalExpiry}
					mounted={mounted}
				/>
				<DocumentStatusCard
					label="Póliza de seguros"
					expiryIso={insuranceExpiry}
					mounted={mounted}
				/>
			</div>
		</section>
	);
}
