"use client";

import { useQuery } from "@tanstack/react-query";
import { Gauge, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/http/api-client";

type SlaSummary = {
	summary: {
		total: number;
		active: number;
		breached: number;
		atRisk: number;
		resolved: number;
		complianceRate: number;
	};
};

export function DashboardSlaWidget() {
	const { data, isLoading } = useQuery<SlaSummary>({
		queryKey: ["sla-summary"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: SlaSummary }>("/sla/summary");
			return json.data;
		},
		refetchInterval: 60_000,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
				<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" />
			</div>
		);
	}

	if (!data) return null;

	const { summary } = data;
	const slaColor = summary.complianceRate >= 95
		? "var(--color-success)"
		: summary.complianceRate >= 80
			? "var(--color-warning)"
			: "var(--color-danger)";

	return (
		<Link
			href="/sla"
			className="block rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 transition hover:shadow-[var(--shadow-2)]"
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<Gauge className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Cumplimiento SLA</h3>
				</div>
				<span
					className="text-2xl font-bold"
					style={{ color: slaColor }}
				>
					{summary.complianceRate}%
				</span>
			</div>
			<div className="grid grid-cols-4 gap-2 text-center text-[10px]">
				<div>
					<p className="font-semibold text-[var(--text-primary)]">{summary.active}</p>
					<p className="text-[var(--text-tertiary)]">Activos</p>
				</div>
				<div>
					<p className="font-semibold text-[var(--color-danger)]">{summary.breached}</p>
					<p className="text-[var(--text-tertiary)]">Incumplidos</p>
				</div>
				<div>
					<p className="font-semibold text-[var(--color-warning)]">{summary.atRisk}</p>
					<p className="text-[var(--text-tertiary)]">En riesgo</p>
				</div>
				<div>
					<p className="font-semibold text-[var(--color-success)]">{summary.resolved}</p>
					<p className="text-[var(--text-tertiary)]">Resueltos</p>
				</div>
			</div>
		</Link>
	);
}
