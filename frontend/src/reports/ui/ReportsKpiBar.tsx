"use client";

import { CheckCircle2, Clock, FileWarning } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/_shared/lib/utils";
import { useReportMonthlyStats, useReportPipeline } from "@/reports/queries";

type KpiTone = "blue" | "green" | "amber" | "red";

const KPI_TONE_CLASS: Record<KpiTone, string> = {
	blue: "border-[color:var(--color-brand-blue)]/20 bg-[var(--color-info-bg)]",
	green: "border-[color:var(--color-success)]/20 bg-[var(--color-success-bg)]",
	amber: "border-[color:var(--color-warning)]/20 bg-[var(--color-warning-bg)]",
	red: "border-[color:var(--color-danger)]/20 bg-[var(--color-danger-bg)]",
};

function KpiCard({
	label,
	value,
	icon,
	subtext,
	tone,
}: {
	label: string;
	value: string | number;
	icon: ReactNode;
	subtext: string;
	tone: KpiTone;
}) {
	return (
		<article
			className={cn(
				"rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-1)]",
				KPI_TONE_CLASS[tone],
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs font-bold uppercase text-[var(--text-secondary)]">{label}</p>
					<p className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
						{value}
					</p>
				</div>
				<span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-primary)]">
					{icon}
				</span>
			</div>
			<p className="mt-2 text-xs text-[var(--text-secondary)]">{subtext}</p>
		</article>
	);
}

export function ReportsKpiBar() {
	const { data: pipelineData } = useReportPipeline();
	const { data: monthlyStats } = useReportMonthlyStats();

	const pendingCount = pipelineData?.summary.totalAwaitingApproval ?? 0;
	const averageClosureDays =
		monthlyStats?.avgClosureDays ?? pipelineData?.summary.averageCompletionToApprovalDays ?? 0;
	const approvedThisMonth = monthlyStats?.approvedThisMonth ?? 0;
	const rejectedThisMonth = monthlyStats?.rejectedThisMonth ?? 0;
	const closureTone: KpiTone =
		averageClosureDays > 5 ? "red" : averageClosureDays > 3.1 ? "amber" : "green";

	return (
		<section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Report indicators">
			<KpiCard
				label="Pendientes revisión"
				value={pendingCount}
				icon={<FileWarning className="h-5 w-5 text-[var(--color-warning)]" />}
				subtext="Órdenes cerradas sin informe aprobado"
				tone="amber"
			/>
			<KpiCard
				label="Tiempo cierre admin"
				value={averageClosureDays > 0 ? `${averageClosureDays.toFixed(1)} d` : "N/A"}
				icon={<Clock className="h-5 w-5 text-[var(--color-brand-blue)]" />}
				subtext="Objetivo gerencial: máximo 3.1 días"
				tone={closureTone}
			/>
			<KpiCard
				label="Volumen facturable"
				value={approvedThisMonth}
				icon={<CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />}
				subtext={`${rejectedThisMonth} rechazados este mes`}
				tone="green"
			/>
		</section>
	);
}
