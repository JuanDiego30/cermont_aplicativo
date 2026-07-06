"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface NextAction {
	id: string;
	action: string;
	module: string;
	urgency: "low" | "medium" | "high";
	dueDate?: string;
}

const URGENCY_STYLES: Record<string, string> = {
	high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface NextActionsPanelProps {
	actions: NextAction[];
	loading?: boolean;
	onActionClick?: (action: NextAction) => void;
}

export function NextActionsPanel({ actions, loading, onActionClick }: NextActionsPanelProps) {
	if (loading) {
		return (
			<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
				<div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
				{["na-1", "na-2", "na-3"].map((id) => (
					<div key={id} className="h-12 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse" />
				))}
			</div>
		);
	}

	if (actions.length === 0) {
		return (
			<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-2 text-gray-500">
					<CheckCircle2 className="size-5 text-green-500" />
					<span className="text-sm">All tasks completed — no pending actions</span>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
			<h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
				<AlertTriangle className="size-4 text-amber-500" />
				Next Actions ({actions.length})
			</h3>
			<ul className="space-y-2">
				{actions.map((action) => (
					<li key={action.id}>
						<button
							type="button"
							onClick={() => onActionClick?.(action)}
							className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
						>
							<span
								className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${URGENCY_STYLES[action.urgency] || URGENCY_STYLES.low}`}
							>
								{action.urgency}
							</span>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{action.action}</p>
								<p className="text-xs text-gray-400">{action.module}</p>
							</div>
							<ArrowRight className="size-4 text-gray-300 shrink-0" />
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
