"use client";

import { Clock3, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

type TimerEnd = { status: "running" } | { status: "stopped"; at: string };

interface ExecutionTimerProps {
	startedAt: string;
	targetMinutes: number;
	end: TimerEnd;
}

function formatElapsed(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function ExecutionTimer({ startedAt, targetMinutes, end }: ExecutionTimerProps) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (end.status === "stopped") {
			return;
		}
		const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(intervalId);
	}, [end.status]);

	const endTime = end.status === "stopped" ? Date.parse(end.at) : now;
	const elapsedSeconds = Math.max(0, Math.floor((endTime - Date.parse(startedAt)) / 1000));
	const targetSeconds = Math.max(60, targetMinutes * 60);
	const consumedPercent = (elapsedSeconds / targetSeconds) * 100;
	const progressScale = Math.min(consumedPercent / 100, 1);
	const isOverdue = consumedPercent > 100;
	const isCritical = consumedPercent > 110;
	const tone = isOverdue
		? "bg-[var(--color-danger)]"
		: consumedPercent >= 80
			? "bg-[var(--color-warning)]"
			: "bg-[var(--color-success)]";

	return (
		<section
			aria-labelledby="execution-timer-title"
			data-testid="execution-timer"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Clock3 className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					<h2
						id="execution-timer-title"
						className="text-sm font-semibold text-[var(--text-primary)]"
					>
						Tiempo de ejecución
					</h2>
				</div>
				<output className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
					{formatElapsed(elapsedSeconds)}
				</output>
			</div>
			<div
				className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]"
				role="progressbar"
				aria-label="Consumo del tiempo estimado"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(consumedPercent)}
			>
				<span
					className={
						"block h-full origin-left rounded-full transition-transform motion-reduce:transition-none " +
						tone
					}
					style={{ transform: `scaleX(${progressScale})` }}
				/>
			</div>
			<p className="mt-2 text-xs text-[var(--text-secondary)]">
				{Math.round(consumedPercent)}% de {targetMinutes} minutos estimados
			</p>
			{isCritical ? (
				<p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--color-danger)]">
					<TriangleAlert className="size-4" aria-hidden="true" />
					La ejecución superó 110% del tiempo estimado.
				</p>
			) : null}
		</section>
	);
}
