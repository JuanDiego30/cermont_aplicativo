"use client";

import { CalendarClock, TriangleAlert } from "lucide-react";

const AT_RISK_THRESHOLD_HOURS = 48;
const HOURS_PER_DAY = 24;

interface SlaDeadlineBadgeProps {
	deadline: string;
}

type SlaState = "overdue" | "at_risk" | "on_track";

function formatSpan(hoursTotal: number): string {
	const hours = Math.floor(Math.abs(hoursTotal));
	if (hours < HOURS_PER_DAY) {
		return hours === 1 ? "1 hora" : `${hours} horas`;
	}
	const days = Math.floor(hours / HOURS_PER_DAY);
	return days === 1 ? "1 día" : `${days} días`;
}

function resolveState(hoursRemaining: number): SlaState {
	if (hoursRemaining < 0) {
		return "overdue";
	}
	if (hoursRemaining <= AT_RISK_THRESHOLD_HOURS) {
		return "at_risk";
	}
	return "on_track";
}

const STATE_CLASSES: Record<SlaState, string> = {
	overdue:
		"border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
	at_risk: "border-brand-warn bg-warning-bg text-brand-warn",
	on_track:
		"border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
};

export function SlaDeadlineBadge({ deadline }: SlaDeadlineBadgeProps) {
	const deadlineMs = new Date(deadline).getTime();
	if (Number.isNaN(deadlineMs)) {
		return <span className="sr-only">Fecha límite inválida</span>;
	}

	const hoursRemaining = (deadlineMs - Date.now()) / (1000 * 60 * 60);
	const state = resolveState(hoursRemaining);
	const label =
		state === "overdue"
			? `SLA vencido hace ${formatSpan(hoursRemaining)}`
			: `SLA vence en ${formatSpan(hoursRemaining)}`;

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATE_CLASSES[state]}`}
			title={new Intl.DateTimeFormat("es-CO", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(deadlineMs)}
		>
			{state === "on_track" ? (
				<CalendarClock className="size-3" aria-hidden="true" />
			) : (
				<TriangleAlert className="size-3" aria-hidden="true" />
			)}
			{label}
		</span>
	);
}
