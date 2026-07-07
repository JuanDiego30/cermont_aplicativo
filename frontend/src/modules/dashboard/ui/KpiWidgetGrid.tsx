"use client";

import { useDashboardKpis } from "../hooks/useDashboardKpis";

function KpiCell({ title, value, unit }: { title: string; value: string; unit: string }) {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
			<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{title}</p>
			<p className="text-2xl font-bold">
				{value} <span className="text-sm text-gray-400 font-normal">{unit}</span>
			</p>
		</div>
	);
}

export function KpiWidgetGrid({ period = "30d" }: { period?: string }) {
	const { data, isLoading } = useDashboardKpis(period);

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			{isLoading ? (
				["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5", "kpi-6"].map((id) => (
					<div
						key={id}
						className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
					>
						<div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
						<div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</div>
				))
			) : (
				<>
					<KpiCell title="MTTR" value={data?.mttr?.toFixed(1) ?? "--"} unit="hours" />
					<KpiCell title="MTBF" value={data?.mtbf?.toFixed(1) ?? "--"} unit="hours" />
					<KpiCell
						title="First Time Fix"
						value={data?.firstTimeFixRate?.toFixed(0) ?? "--"}
						unit="%"
					/>
					<KpiCell
						title="Utilization"
						value={data?.technicianUtilizationRate?.toFixed(0) ?? "--"}
						unit="%"
					/>
					<KpiCell title="SLA" value={data?.slaCompliance?.toFixed(0) ?? "--"} unit="%" />
					<KpiCell
						title="Certifications"
						value={String(data?.pendingCertifications ?? "--")}
						unit="pending"
					/>
				</>
			)}
		</div>
	);
}
