"use client";

/**
 * FleetAlertsBanner — Critical fleet alerts banner on the dashboard.
 * Displays warnings for expired documents (SOAT, Tecnomecánica, Póliza)
 * or those expiring within the next 7 days.
 *
 * Plugs directly into the useExpiringVehicleDocuments hook.
 */

import { AlertOctagon, AlertTriangle, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useExpiringVehicleDocuments } from "@/modules/fleet/queries";

const DOCUMENT_LABELS: Record<string, string> = {
	soat: "SOAT",
	tecnomecanica: "Tecnomecánica",
	poliza: "Póliza de Seguro",
};

export function FleetAlertsBanner() {
	const { data: alerts, isLoading } = useExpiringVehicleDocuments();
	const [isVisible, setIsVisible] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || isLoading || !alerts || alerts.length === 0 || !isVisible) {
		return null;
	}

	// Filter critical ones (already expired or expiring in <= 7 days)
	const criticalAlerts = alerts.filter((alert) => {
		if (alert.expired) {
			return true;
		}
		const daysLeft = Math.ceil(
			(new Date(alert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
		);
		return daysLeft <= 7;
	});

	if (criticalAlerts.length === 0) {
		return null;
	}

	const expiredCount = criticalAlerts.filter((a) => a.expired).length;

	return (
		<div
			className={`relative overflow-hidden rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-1)] transition-all duration-300 ${
				expiredCount > 0
					? "border-[var(--color-danger-bg)] bg-gradient-to-r from-[var(--color-danger-bg)]/30 to-[var(--surface-primary)]"
					: "border-[var(--color-warning-bg)] bg-gradient-to-r from-[var(--color-warning-bg)]/25 to-[var(--surface-primary)]"
			}`}
			role="alert"
		>
			<div className="flex items-start gap-3">
				<div
					className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
						expiredCount > 0 ? "bg-[var(--color-danger-bg)]" : "bg-[var(--color-warning-bg)]"
					}`}
				>
					{expiredCount > 0 ? (
						<AlertOctagon className="size-5 text-[var(--color-danger)]" aria-hidden="true" />
					) : (
						<AlertTriangle className="size-5 text-[var(--color-warning)]" aria-hidden="true" />
					)}
				</div>

				<div className="min-w-0 flex-1">
					<h2
						className={`text-sm font-semibold leading-snug ${
							expiredCount > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]"
						}`}
					>
						{expiredCount > 0 ? (
							<>
								Alerta Crítica: {expiredCount} vehículo
								{expiredCount > 1 ? "s tienen" : " tiene"} documentos vencidos
							</>
						) : (
							<>Atención: Documentos próximos a vencer (menos de 7 días)</>
						)}
					</h2>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						Los vehículos con documentos vencidos no podrán ser asignados a conductores para el
						trabajo en campo.
					</p>

					{/* List of critical alerts */}
					<ul className="mt-2.5 space-y-1">
						{criticalAlerts.slice(0, 3).map((alert) => {
							const days = Math.ceil(
								(new Date(alert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
							);
							return (
								<li
									key={`${alert.vehicleId}-${alert.documentType}`}
									className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]"
								>
									<span className="font-semibold">{alert.plate}</span>
									<span className="text-[var(--text-secondary)]">—</span>
									<span className="font-medium">{DOCUMENT_LABELS[alert.documentType]}</span>
									{alert.expired ? (
										<span className="font-semibold text-[var(--color-danger)] uppercase text-[10px]">
											[VENCIDO]
										</span>
									) : (
										<span className="text-[var(--color-warning)] font-medium">
											(vence en {days} día{days !== 1 ? "s" : ""})
										</span>
									)}
								</li>
							);
						})}
						{criticalAlerts.length > 3 && (
							<li className="text-[10px] text-[var(--text-tertiary)] font-medium">
								+ {criticalAlerts.length - 3} alertas de documentos adicionales.
							</li>
						)}
					</ul>

					{/* Link to Fleet module */}
					<div className="mt-3 flex">
						<Link
							href="/fleet"
							className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
								expiredCount > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-brand-blue)]"
							}`}
						>
							Gestionar parque automotor
							<ChevronRight className="size-3" aria-hidden="true" />
						</Link>
					</div>
				</div>

				{/* Close button */}
				<button
					type="button"
					onClick={() => setIsVisible(false)}
					className="rounded-[var(--radius-lg)] p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
					aria-label="Cerrar alerta"
				>
					<X className="size-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
