"use client";

/**
 * EvidenceReportPage — summary of evidence grouped by order/category.
 *
 * Shows:
 * - Evidence count by category (before/after/finding/closure)
 * - Evidence count by order
 * - Missing required evidence warnings
 */

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Camera, CheckCircle2, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { EVIDENCE_KEYS } from "@/modules/evidences/keys";
import { apiClient } from "@/lib/http/api-client";

const CATEGORY_LABELS: Record<string, string> = {
	before: "Antes",
	after: "Después",
	finding: "Hallazgo",
	closure: "Cierre",
	general: "General",
};

interface EvidenceSummaryEnvelope {
	success: boolean;
	data: {
		totalCount: number;
		byCategory: Record<string, number>;
		byOrder: Array<{
			orderId: string;
			orderCode: string;
			count: number;
			categories: string[];
		}>;
		missingRequired: Array<{
			orderId: string;
			orderCode: string;
			missingTypes: string[];
		}>;
	};
}

async function fetchEvidenceSummary(): Promise<EvidenceSummaryEnvelope["data"]> {
	const res = await apiClient.get<EvidenceSummaryEnvelope>("/evidences/summary");
	return res.data;
}

export default function EvidenceReportPage() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: EVIDENCE_KEYS.summary(),
		queryFn: fetchEvidenceSummary,
	});

	if (isLoading) {
		return (
			<section aria-label="Loading evidence report" className="flex justify-center py-16">
				<Loader2 className="size-8 animate-spin text-brand" />
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col items-center gap-4 py-16">
				<AlertTriangle className="size-8 text-danger" />
				<h2 className="text-lg font-semibold">Error loading evidence report</h2>
				<Button variant="secondary" onClick={() => refetch()}>
					Retry
				</Button>
			</section>
		);
	}

	if (!data || data.totalCount === 0) {
		return (
			<EmptyState
				icon={Camera}
				title="No evidence records"
				description="Upload evidence from execution sessions to see the report."
			/>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="evidence-report-title">
			<header className="flex items-center justify-between">
				<div>
					<h1 id="evidence-report-title" className="text-2xl font-bold text-[var(--text-primary)]">
						Evidence Report
					</h1>
					<p className="mt-1 text-sm text-secondary">{data.totalCount} total evidence items</p>
				</div>
				<Button variant="secondary" size="sm" onClick={() => refetch()}>
					Refresh
				</Button>
			</header>

			{/* Category breakdown */}
			<section
				aria-label="By category"
				className="rounded-xl border border-hairline bg-surface p-5 shadow-card"
			>
				<h2 className="text-sm font-semibold text-primary mb-4">By Category</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{Object.entries(data.byCategory).map(([cat, count]) => (
						<div
							key={cat}
							className="flex items-center gap-3 rounded-lg border border-hairline bg-background p-3"
						>
							<Camera className="size-5 text-brand" aria-hidden="true" />
							<div>
								<p className="text-lg font-bold text-primary">{count}</p>
								<p className="text-xs text-secondary">{CATEGORY_LABELS[cat] ?? cat}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* By order */}
			<section
				aria-label="By order"
				className="rounded-xl border border-hairline bg-surface p-5 shadow-card"
			>
				<h2 className="text-sm font-semibold text-primary mb-4">By Order</h2>
				{data.byOrder.length === 0 ? (
					<p className="text-sm text-secondary">No evidence linked to orders yet.</p>
				) : (
					<div className="space-y-3">
						{data.byOrder.map((item) => (
							<Link
								key={item.orderId}
								href={`/evidences?orderId=${item.orderId}`}
								className="flex items-center justify-between rounded-lg border border-hairline bg-background p-3 hover:border-brand transition-colors"
							>
								<div className="flex items-center gap-3">
									<FileText className="size-5 text-brand" aria-hidden="true" />
									<div>
										<p className="text-sm font-semibold text-primary">{item.orderCode}</p>
										<p className="text-xs text-secondary">
											{item.categories.map((c) => CATEGORY_LABELS[c] ?? c).join(" · ")}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-success" aria-hidden="true" />
									<span className="text-lg font-bold text-primary">{item.count}</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</section>

			{/* Missing required evidence */}
			{data.missingRequired.length > 0 && (
				<section
					aria-label="Missing required"
					className="rounded-xl border border-danger-bg bg-danger-bg/30 p-5"
				>
					<h2 className="flex items-center gap-2 text-sm font-semibold text-danger mb-4">
						<AlertTriangle className="size-4" />
						Missing Required Evidence
					</h2>
					<div className="space-y-3">
						{data.missingRequired.map((item) => (
							<div key={item.orderId} className="rounded-lg border border-danger-bg bg-surface p-3">
								<p className="text-sm font-semibold text-primary">{item.orderCode}</p>
								<p className="text-xs text-danger mt-1">Missing: {item.missingTypes.join(", ")}</p>
							</div>
						))}
					</div>
				</section>
			)}
		</section>
	);
}
