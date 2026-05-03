"use client";

import type { AnalyticsPeriod } from "@cermont/shared-types";
import { useState } from "react";
import {
	LazyBillingVsCostChart,
	LazyReportCycleTimeChart,
	LazyTechnicianRankingChart,
} from "@/_shared/lib/utils/lazy";
import {
	useBillingVsCost,
	useReportCycleTimeDistribution,
	useReportTechnicianRanking,
} from "@/dashboard/hooks/useDashboardKpis";
import type { ReportTemplate } from "@/reports/config/report-templates";
import { REPORT_TEMPLATES } from "@/reports/config/report-templates";
import { ReportTemplateSelector } from "./ReportTemplateSelector";

const PERIOD_OPTIONS: Array<{ label: string; value: AnalyticsPeriod }> = [
	{ label: "7d", value: "7d" },
	{ label: "30d", value: "30d" },
	{ label: "90d", value: "90d" },
];

export function ReportsAnalyticsSection() {
	const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
	const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
	const cycleTime = useReportCycleTimeDistribution(period);
	const technicianRanking = useReportTechnicianRanking(period);
	const billingVsCost = useBillingVsCost(period);

	const handleTemplateSelect = (template: ReportTemplate) => {
		setSelectedTemplate(template);
		setPeriod(template.period);
	};

	const isCycleVisible = selectedTemplate.visibleCharts.includes("cycle");
	const isTechniciansVisible = selectedTemplate.visibleCharts.includes("technicians");
	const isBillingVisible = selectedTemplate.visibleCharts.includes("billing");

	return (
		<section className="space-y-5" aria-labelledby="reports-analytics-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 id="reports-analytics-title" className="text-xl font-bold text-[var(--text-primary)]">
						Analítica histórica
					</h2>
					<p className="text-sm text-[var(--text-secondary)]">
						Controla tiempos de aprobación, rendimiento y margen operativo.
					</p>
				</div>
				<fieldset className="inline-flex w-fit rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-1">
					<legend className="sr-only">Periodo de analítica</legend>
					{PERIOD_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => setPeriod(option.value)}
							aria-pressed={period === option.value}
							className={`rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-semibold transition-colors ${
								period === option.value
									? "bg-[var(--color-info-bg)] text-[var(--color-brand-blue)]"
									: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							}`}
						>
							{option.label}
						</button>
					))}
				</fieldset>
			</header>

			<ReportTemplateSelector
				selectedTemplateId={selectedTemplate.id}
				onTemplateSelect={handleTemplateSelect}
			/>

			<div className="grid gap-4 xl:grid-cols-2">
				{isCycleVisible ? (
					<LazyReportCycleTimeChart data={cycleTime.data ?? []} loading={cycleTime.isLoading} />
				) : null}
				{isTechniciansVisible ? (
					<LazyTechnicianRankingChart
						data={technicianRanking.data ?? []}
						loading={technicianRanking.isLoading}
					/>
				) : null}
				{isBillingVisible ? (
					<LazyBillingVsCostChart
						data={billingVsCost.data ?? []}
						loading={billingVsCost.isLoading}
					/>
				) : null}
			</div>
		</section>
	);
}
