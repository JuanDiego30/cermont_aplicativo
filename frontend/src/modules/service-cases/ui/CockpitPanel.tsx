"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/http/api-client";
import { FourteenStepProgress } from "./FourteenStepProgress";

interface CockpitData {
	orderId: string;
	orderCode: string;
	currentStep: number;
	stepStatuses: Record<number, string>;
	blockers: Array<{ step: number; reason: string; severity: "low" | "medium" | "high" }>;
	nextActions: Array<{ action: string; module: string; urgency: "low" | "medium" | "high" }>;
	costSummary: {
		estimated: number;
		actual: number;
		margin: number;
		marginPercent: number;
		isAtRisk: boolean;
	};
	timeline: Array<{ step: number; action: string; actor: string; timestamp: string }>;
}

const STEP_LABELS: Record<number, string> = {
	1: "Work Request",
	2: "Site Visit",
	3: "Proposal",
	4: "Purchase Order",
	5: "Planning",
	6: "Execution",
	7: "Technical Report",
	8: "Delivery Record",
	9: "Acceptance",
	10: "SES",
	11: "SES Approval",
	12: "Invoice",
	13: "Invoice Approval",
	14: "Payment",
};

function LoadingState() {
	return (
		<div className="space-y-4 p-4 animate-pulse">
			<div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
			<div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
			<div className="grid grid-cols-3 gap-4">
				<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
			</div>
		</div>
	);
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-950/20">
			<p className="text-red-600 dark:text-red-400 mb-2 text-sm">Could not load cockpit data</p>
			<button type="button" onClick={onRetry} className="text-sm text-cermont-blue hover:underline">
				Retry
			</button>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
			<p className="text-gray-500 text-sm">No cockpit data available for this case</p>
		</div>
	);
}

export function CockpitPanel({ orderId }: { orderId: string }) {
	const [retry, setRetry] = useState(0);
	const { data, isLoading, error, refetch } = useQuery<CockpitData>({
		queryKey: ["service-cases", orderId, "cockpit", retry],
		queryFn: () => apiClient.get(`/service-cases/${orderId}/cockpit`),
	});

	if (isLoading) {
		return <LoadingState />;
	}
	if (error) {
		return (
			<ErrorState
				onRetry={() => {
					setRetry((r) => r + 1);
					refetch();
				}}
			/>
		);
	}
	if (!data) {
		return <EmptyState />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Order {data.orderCode}</h2>
				<span
					className={`px-2 py-1 rounded-full text-xs font-medium ${
						data.costSummary.isAtRisk
							? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
					}`}
				>
					Step {data.currentStep}: {STEP_LABELS[data.currentStep] || `Step ${data.currentStep}`}
				</span>
			</div>

			<FourteenStepProgress
				currentStep={data.currentStep}
				stepStatuses={
					data.stepStatuses as Record<
						number,
						"pending" | "active" | "completed" | "blocked" | "skipped"
					>
				}
			/>

			{data.blockers.length > 0 && (
				<div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20">
					<h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
						Blockers ({data.blockers.length})
					</h3>
					<ul className="space-y-1">
						{data.blockers.map((b) => (
							<li
								key={`blk-${b.step}-${b.reason.slice(0, 20)}`}
								className="flex items-center gap-2 text-sm"
							>
								<span
									className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
										b.severity === "high"
											? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
											: b.severity === "medium"
												? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
												: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
									}`}
								>
									{b.severity}
								</span>
								<span className="text-gray-600 dark:text-gray-400">{b.reason}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
					<p className="text-2xl font-bold">
						${(data.costSummary.estimated || 0).toLocaleString()}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p className="text-xs text-gray-500 mb-1">Actual Cost</p>
					<p className="text-2xl font-bold">${(data.costSummary.actual || 0).toLocaleString()}</p>
				</div>
				<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
					<p className="text-xs text-gray-500 mb-1">Margin</p>
					<p
						className={`text-2xl font-bold ${data.costSummary.isAtRisk ? "text-red-600" : "text-green-600"}`}
					>
						{data.costSummary.marginPercent.toFixed(1)}%
					</p>
				</div>
			</div>
		</div>
	);
}
