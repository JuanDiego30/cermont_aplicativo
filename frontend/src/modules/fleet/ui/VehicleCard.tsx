"use client";

/**
 * VehicleCard — Professional card component for the fleet list.
 * Shows primary photo, readiness score, document expiry countdowns.
 * Reference design: Limble CMMS, FieldAware asset cards.
 */

import { evaluateFleetReadiness } from "@cermont/domain";
import type { Vehicle } from "@cermont/shared-types";
import { AlertTriangle, CalendarClock, CheckCircle2, Gauge, Truck, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── DocumentChip ────────────────────────────────────────────────────────────

interface DocumentChipProps {
	label: string;
	expiryIso?: string;
	mounted: boolean;
}

function DocumentChip({ label, expiryIso, mounted }: DocumentChipProps) {
	if (!expiryIso) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]">
				{label}: sin registrar
			</span>
		);
	}

	const days = mounted ? daysUntil(expiryIso) : null;

	let colorClass: string;
	let icon: React.ReactNode;

	if (days === null) {
		colorClass = "border-[var(--border-subtle)] text-[var(--text-tertiary)]";
		icon = null;
	} else if (days < 0) {
		colorClass =
			"border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 text-[var(--color-danger)]";
		icon = <AlertTriangle className="size-2.5 shrink-0" aria-hidden="true" />;
	} else if (days <= 30) {
		colorClass =
			"border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/60 text-[var(--color-warning)]";
		icon = <CalendarClock className="size-2.5 shrink-0" aria-hidden="true" />;
	} else {
		colorClass =
			"border-[var(--color-success-bg)] bg-[var(--color-success-bg)]/60 text-[var(--color-success)]";
		icon = <CheckCircle2 className="size-2.5 shrink-0" aria-hidden="true" />;
	}

	const label2 =
		days === null
			? label
			: days < 0
				? `${label}: vencido`
				: days === 0
					? `${label}: vence hoy`
					: `${label}: ${days}d`;

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorClass}`}
		>
			{icon}
			{label2}
		</span>
	);
}

// ─── ReadinessIndicator ───────────────────────────────────────────────────────

function ReadinessIndicator({
	score,
	ready,
	blockerCount,
}: {
	score: number;
	ready: boolean;
	blockerCount: number;
}) {
	const color = ready
		? "text-[var(--color-success)]"
		: score >= 60
			? "text-[var(--color-warning)]"
			: "text-[var(--color-danger)]";

	return (
		<div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
			<Gauge className="size-3.5 shrink-0" aria-hidden="true" />
			<span>{score}%</span>
			{!ready && blockerCount > 0 && (
				<span className="font-normal text-[var(--text-tertiary)]">
					({blockerCount} bloqueador{blockerCount > 1 ? "es" : ""})
				</span>
			)}
		</div>
	);
}

// ─── VehicleCard ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
	active: "Activo",
	maintenance: "En mantenimiento",
	out_of_service: "Fuera de servicio",
};

const STATUS_PILL: Record<string, string> = {
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	maintenance: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	out_of_service: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

interface VehicleCardProps {
	vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
	const mounted = useMounted();

	const readiness = useMemo(
		() =>
			evaluateFleetReadiness({
				soatExpiry: vehicle.soatExpiry,
				technoMechanicalExpiry: vehicle.technoMechanicalExpiry,
				insuranceExpiry: vehicle.insuranceExpiry,
				lastMaintenanceAt: vehicle.lastMaintenanceAt,
				status: vehicle.status,
			}),
		[vehicle],
	);

	const primaryPhoto = vehicle.primaryPhoto;
	const primaryPhotoUrl =
		primaryPhoto && primaryPhoto.status === "present"
			? (vehicle.fileAssets.find((fa) => fa.id === primaryPhoto.fileAssetId)?.url ?? null)
			: null;

	return (
		<Link
			href={`/fleet/${vehicle._id}`}
			className="group relative flex gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all duration-200 hover:border-[var(--color-brand-blue)]/40 hover:shadow-[var(--shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			aria-label={`Vehículo ${vehicle.plate} — ${STATUS_LABELS[vehicle.status] ?? vehicle.status}`}
		>
			{/* Photo column */}
			<div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] sm:size-24">
				{primaryPhotoUrl ? (
					<Image
						src={primaryPhotoUrl}
						alt={`Foto de ${vehicle.plate}`}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="96px"
						unoptimized
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Truck
							className="size-8 text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--color-brand-blue)]"
							aria-hidden="true"
						/>
					</div>
				)}
			</div>

			{/* Content column */}
			<div className="min-w-0 flex-1">
				{/* Title row */}
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">
						{vehicle.plate}
					</h3>
					<span
						className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[vehicle.status] ?? ""}`}
					>
						{STATUS_LABELS[vehicle.status] ?? vehicle.status}
					</span>
					<ReadinessIndicator
						score={readiness.score}
						ready={readiness.ready}
						blockerCount={readiness.blockers.length}
					/>
				</div>

				{/* Subtitle */}
				<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
					{vehicle.brand} {vehicle.model} {vehicle.year}
					{" · "}
					<span className="tabular-nums">{vehicle.kilometers.toLocaleString("es-CO")} km</span>
				</p>

				{/* Driver */}
				{vehicle.driverName && (
					<p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
						<User className="size-3 shrink-0" aria-hidden="true" />
						{vehicle.driverName}
					</p>
				)}

				{/* Document chips */}
				<div className="mt-2 flex flex-wrap gap-1.5">
					<DocumentChip label="SOAT" expiryIso={vehicle.soatExpiry} mounted={mounted} />
					<DocumentChip
						label="Tecnomecánica"
						expiryIso={vehicle.technoMechanicalExpiry}
						mounted={mounted}
					/>
					<DocumentChip label="Póliza" expiryIso={vehicle.insuranceExpiry} mounted={mounted} />
				</div>
			</div>

			{/* Hover accent */}
			<div className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-l-full bg-[var(--color-brand-blue)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
		</Link>
	);
}
