"use client";

/**
 * MaintenanceTab — Vehicle maintenance section.
 *
 * Shows current maintenance status and allows updating:
 *   - lastMaintenanceAt (date)
 *   - nextMaintenanceKm (number)
 *   - notes (text)
 *
 * Displays an alert when kilometers >= nextMaintenanceKm.
 * Uses the existing updateVehicle endpoint (PATCH /fleet/:id).
 */

import { AlertTriangle, Gauge, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateVehicle } from "../queries";
import { localeNumber } from "@/lib/utils/format-date";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MaintenanceTabProps {
	vehicleId: string;
	lastMaintenanceAt?: string;
	nextMaintenanceKm?: number;
	kilometers: number;
	notes?: string;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const inputCls =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)]";

const labelCls = "flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]";

// ─── Component ────────────────────────────────────────────────────────────────

export function MaintenanceTab({
	vehicleId,
	lastMaintenanceAt,
	nextMaintenanceKm,
	kilometers,
	notes: initialNotes,
}: MaintenanceTabProps) {
	const updateMutation = useUpdateVehicle();

	const [lastMaintenanceAtInput, setLastMaintenanceAtInput] = useState(
		lastMaintenanceAt ? new Date(lastMaintenanceAt).toISOString().slice(0, 10) : "",
	);
	const [nextMaintenanceKmInput, setNextMaintenanceKmInput] = useState(
		nextMaintenanceKm?.toString() ?? "",
	);
	const [notesInput, setNotesInput] = useState(initialNotes ?? "");

	const isOverdue =
		nextMaintenanceKm !== undefined && nextMaintenanceKm > 0 && kilometers >= nextMaintenanceKm;

	const nextMaintenanceDisplay = nextMaintenanceKm
		? `${localeNumber(nextMaintenanceKm)} km`
		: "No configurado";
	const remainingKm =
		nextMaintenanceKm !== undefined && nextMaintenanceKm > 0
			? Math.max(0, nextMaintenanceKm - kilometers)
			: null;

	async function handleSave() {
		try {
			await updateMutation.mutateAsync({
				id: vehicleId,
				input: {
					lastMaintenanceAt: lastMaintenanceAtInput
						? `${lastMaintenanceAtInput}T00:00:00.000Z`
						: undefined,
					nextMaintenanceKm: nextMaintenanceKmInput ? Number(nextMaintenanceKmInput) : undefined,
					notes: notesInput || undefined,
				},
			});
			toast.success("Mantenimiento actualizado");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error al actualizar");
		}
	}

	return (
		<section aria-labelledby="maintenance-title" className="space-y-5">
			<h2 id="maintenance-title" className="text-base font-semibold text-[var(--text-primary)]">
				Mantenimiento del vehículo
			</h2>

			{/* ── Overdue alert ── */}
			{isOverdue && (
				<div
					className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-danger-bg)] bg-gradient-to-r from-[var(--color-danger-bg)]/40 to-transparent p-4"
					role="alert"
				>
					<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger-bg)]">
						<AlertTriangle className="size-4 text-[var(--color-danger)]" aria-hidden="true" />
					</div>
					<div>
						<p className="text-sm font-semibold text-[var(--color-danger)]">
							Mantenimiento vencido por kilometraje
						</p>
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
							El vehículo ha superado el kilometraje programado para mantenimiento (
							{nextMaintenanceDisplay}). Programa el mantenimiento preventivo lo antes posible.
						</p>
					</div>
				</div>
			)}

			{/* ── Maintenance status cards ── */}
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
					<div
						className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? "bg-[var(--color-danger-bg)]" : "bg-[var(--surface-secondary)]"}`}
					>
						<Gauge
							className={`size-5 ${isOverdue ? "text-[var(--color-danger)]" : "text-[var(--text-tertiary)]"}`}
							aria-hidden="true"
						/>
					</div>
					<div>
						<p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
							Kilometraje actual
						</p>
						<p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--text-primary)]">
							{localeNumber(kilometers)} km
						</p>
					</div>
				</div>

				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
					<div
						className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? "bg-[var(--color-danger-bg)]" : "bg-[var(--surface-secondary)]"}`}
					>
						<Wrench
							className={`size-5 ${isOverdue ? "text-[var(--color-danger)]" : "text-[var(--text-tertiary)]"}`}
							aria-hidden="true"
						/>
					</div>
					<div>
						<p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
							Próximo mantenimiento
						</p>
						<p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--text-primary)]">
							{nextMaintenanceDisplay}
						</p>
						{remainingKm !== null && (
							<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
								{localeNumber(remainingKm)} km restantes
							</p>
						)}
					</div>
				</div>
			</div>

			{/* ── Update form ── */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
					Actualizar mantenimiento
				</h3>
				<div className="space-y-4">
					<label className={labelCls}>
						Último mantenimiento
						<input
							type="date"
							value={lastMaintenanceAtInput}
							onChange={(e) => setLastMaintenanceAtInput(e.target.value)}
							className={inputCls}
						/>
					</label>

					<label className={labelCls}>
						Próximo mantenimiento (km)
						<input
							type="number"
							inputMode="numeric"
							min={0}
							value={nextMaintenanceKmInput}
							onChange={(e) => setNextMaintenanceKmInput(e.target.value)}
							placeholder="Ej: 10000"
							className={inputCls}
						/>
					</label>

					<label className={labelCls}>
						Observaciones
						<textarea
							rows={3}
							value={notesInput}
							onChange={(e) => setNotesInput(e.target.value)}
							placeholder="Estado del mantenimiento, próximas acciones…"
							className={inputCls}
						/>
					</label>

					<button
						type="button"
						onClick={handleSave}
						disabled={updateMutation.isPending}
						className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
					>
						{updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
					</button>

					{updateMutation.error && (
						<p role="alert" className="text-xs text-[var(--color-danger)]">
							{updateMutation.error instanceof Error
								? updateMutation.error.message
								: "No se pudo actualizar el mantenimiento"}
						</p>
					)}
				</div>
			</div>
		</section>
	);
}
