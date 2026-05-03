"use client";

import type { AlertSeverity, AlertType, DashboardAlert } from "@cermont/shared-types";
import {
	AlertCircle,
	AlertTriangle,
	ArrowRight,
	Bell,
	CheckCircle2,
	Clock,
	FileText,
	type LucideIcon,
	ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/core/ui/Skeleton";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";

const severityConfig: Record<AlertSeverity, { color: string; bg: string; icon: LucideIcon }> = {
	critical: {
		color: "text-[var(--color-danger)]",
		bg: "bg-[var(--color-danger-bg)]",
		icon: AlertCircle,
	},
	warning: {
		color: "text-[var(--color-warning)]",
		bg: "bg-[var(--color-warning-bg)]",
		icon: AlertTriangle,
	},
	info: {
		color: "text-[var(--color-info)]",
		bg: "bg-[var(--color-info-bg)]",
		icon: Clock,
	},
};

const typeIconConfig: Record<AlertType, LucideIcon> = {
	missing_report: FileText,
	unsigned_delivery_record: CheckCircle2,
	pending_ses: FileText,
	pending_invoice_approval: Clock,
	expiring_certification: ShieldAlert,
};

export function AlertsPanel() {
	const { data: alerts, isLoading, error } = useDashboardAlerts();

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
					<Bell className="h-5 w-5 text-[var(--text-secondary)]" />
					<h2 className="text-lg font-bold text-[var(--text-primary)]">Alertas de operación</h2>
				</div>
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} variant="text" className="h-20 w-full rounded-md" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-4 text-sm text-[var(--color-danger)] shadow-[var(--shadow-1)]">
				No se pudieron cargar las alertas.
			</div>
		);
	}

	if (!alerts || alerts.length === 0) {
		return (
			<div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
					<Bell className="h-5 w-5 text-[var(--text-secondary)]" />
					<h2 className="text-lg font-bold text-[var(--text-primary)]">Alertas de operación</h2>
				</div>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<CheckCircle2 className="mb-2 h-8 w-8 text-[var(--color-success)]" />
					<p className="text-sm font-medium text-[var(--text-primary)]">Todo al da</p>
					<p className="text-xs text-[var(--text-secondary)]">No hay alertas pendientes.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
				<div className="flex items-center gap-2">
					<Bell className="h-5 w-5 text-[var(--text-secondary)]" />
					<h2 className="text-lg font-bold text-[var(--text-primary)]">Alertas de operación</h2>
				</div>
				<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs font-bold text-white">
					{alerts.length}
				</span>
			</div>

			<div className="flex flex-col gap-3">
				{alerts.map((alert: DashboardAlert) => {
					const SeverityIcon = severityConfig[alert.severity].icon;
					const TypeIcon = typeIconConfig[alert.type];
					const { color, bg } = severityConfig[alert.severity];

					return (
						<div
							key={alert.id}
							className="group relative flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3 transition-colors hover:border-[var(--border-hover)]"
						>
							<div className="flex items-start gap-3">
								<div
									className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}
								>
									<TypeIcon className={`h-4 w-4 ${color}`} />
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-semibold text-[var(--text-primary)]">
											{alert.title}
										</h3>
										<SeverityIcon className={`h-3.5 w-3.5 ${color}`} />
									</div>
									<p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
										{alert.description}
									</p>
								</div>
							</div>
							<div className="mt-1 flex justify-end">
								<Link
									href={alert.actionUrl}
									className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-hover)]"
								>
									{alert.actionLabel}
									<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
								</Link>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
