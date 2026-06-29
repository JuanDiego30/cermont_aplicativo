"use client";

/**
 * FleetReadinessBadge — Visual indicator for vehicle readiness score
 * Uses domain rules from @cermont/domain
 */

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface FleetReadinessBadgeProps {
	score: number;
	ready: boolean;
	blockerCount: number;
}

export function FleetReadinessBadge({ score, ready, blockerCount }: FleetReadinessBadgeProps) {
	const color = ready
		? "var(--color-success)"
		: score >= 50
			? "var(--color-warning)"
			: "var(--color-danger)";

	const bgColor = ready
		? "var(--color-success-bg)"
		: score >= 50
			? "var(--color-warning-bg)"
			: "var(--color-danger-bg)";

	const Icon = ready ? CheckCircle2 : blockerCount > 0 ? XCircle : AlertTriangle;

	return (
		<div
			className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
			style={{ backgroundColor: bgColor, color }}
			title={
				ready
					? "Vehículo listo para operar"
					: `${blockerCount} bloqueo(s) pendiente(s)`
			}
		>
			<Icon className="size-3.5" aria-hidden="true" />
			{score}%
		</div>
	);
}
