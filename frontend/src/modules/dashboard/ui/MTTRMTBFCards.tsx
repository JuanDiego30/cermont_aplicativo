"use client";

import { Clock, Repeat } from "lucide-react";

interface Props {
	mttr: number;
	mtbf: number;
}

export function MTTRMTBFCards({ mttr, mtbf }: Props) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
					<Clock className="size-5 text-brand-blue" aria-hidden="true" />
				</span>
				<div>
					<p className="font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
						{mttr} min
					</p>
					<p className="text-sm text-[var(--text-secondary)]">MTTR</p>
				</div>
			</div>
			<div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-warn/10">
					<Repeat className="size-5 text-brand-warn" aria-hidden="true" />
				</span>
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
