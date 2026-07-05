import { AlertTriangle, Clock } from "lucide-react";
import type { CockpitData } from "../model/cockpit.types";

const RISK_BADGES: Record<string, { label: string; className: string }> = {
	low: { label: "Bajo", className: "bg-green-100 text-green-800" },
	medium: { label: "Medio", className: "bg-yellow-100 text-yellow-800" },
	high: { label: "Alto", className: "bg-orange-100 text-orange-800" },
	critical: { label: "Crítico", className: "bg-red-100 text-red-800" },
};

function slaCountdown(deadline?: string): string {
	if (!deadline) {
		return "Sin fecha límite";
	}
	const remaining = new Date(deadline).getTime() - Date.now();
	if (remaining <= 0) {
		return "Vencido";
	}
	const hours = Math.floor(remaining / (1000 * 60 * 60));
	return `Vence en ${hours}h`;
}

interface Props {
	cockpit: CockpitData;
}

export function CockpitHeaderCard({ cockpit }: Props) {
	const risk = RISK_BADGES[cockpit.riskLevel] ?? RISK_BADGES.low;

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="font-mono text-sm text-[var(--text-secondary)]">{cockpit.code}</p>
					<h1 className="mt-1 truncate text-xl font-semibold text-[var(--text-primary)]">
						{cockpit.clientName}
					</h1>
					<p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
						{cockpit.description}
					</p>
				</div>

				<div className="flex shrink-0 flex-wrap items-center gap-3">
					<span
						className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${risk.className}`}
					>
						<AlertTriangle className="size-3" aria-hidden="true" />
						{risk.label}
					</span>

					<span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
						<Clock className="size-3" aria-hidden="true" />
						{slaCountdown(cockpit.slaDeadline)}
					</span>
				</div>
			</div>

			<p className="mt-4 text-xs text-[var(--text-tertiary)]">
				Generado: {new Date(cockpit.generatedAt).toLocaleString("es-CO")}
			</p>
		</div>
	);
}
