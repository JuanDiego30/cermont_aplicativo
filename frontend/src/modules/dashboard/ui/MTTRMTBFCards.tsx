"use client";

import { Clock, Repeat } from "lucide-react";

interface Props {
	mttr: number;
	mtbf: number;
}

function metricColor(value: number, thresholds: [number, number]): string {
	if (value <= thresholds[0]) {
		return "text-[#4CAF50]";
	}
	if (value <= thresholds[1]) {
		return "text-[#FFC107]";
	}
	return "text-[#F44336]";
}

export function MTTRMTBFCards({ mttr, mtbf }: Props) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<Clock className={`size-8 ${metricColor(mttr, [30, 60])}`} aria-hidden="true" />
				<div>
					<p className="font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
						{mttr} min
					</p>
					<p className="text-sm text-[var(--text-secondary)]">MTTR</p>
				</div>
			</div>
			<div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<Repeat className={`size-8 ${metricColor(100 - mtbf, [30, 60])}`} aria-hidden="true" />
				<div>
					<p className="font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
						{mtbf} días
					</p>
					<p className="text-sm text-[var(--text-secondary)]">MTBF</p>
				</div>
			</div>
		</div>
	);
}
