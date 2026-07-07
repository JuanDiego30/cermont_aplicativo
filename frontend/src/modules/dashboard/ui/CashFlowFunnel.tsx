"use client";

interface FunnelStage {
	label: string;
	count: number;
	amount: number;
}

interface Props {
	stages: FunnelStage[];
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function CashFlowFunnel({ stages }: Props) {
	if (stages.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
				Sin datos de pipeline financiero
			</p>
		);
	}

	const maxCount = Math.max(...stages.map((s) => s.count), 1);

	return (
		<div className="space-y-2">
			{stages.map((stage, index) => {
				const widthPct = Math.max((stage.count / maxCount) * 100, 15);
				const colors = [
					"bg-[var(--color-brand-blue)]",
					"bg-blue-400",
					"bg-indigo-300",
					"bg-[#4CAF50]",
				];

				return (
					<div
						key={stage.label}
						className="flex items-center gap-3"
						style={{ paddingLeft: `${index * 2}rem`, paddingRight: `${index * 2}rem` }}
					>
						<div
							className="flex h-10 items-center justify-between rounded-md px-4 text-white"
							style={{ width: `${widthPct}%` }}
						>
							<div
								className={`rounded-md px-3 py-2 ${colors[index % colors.length]}`}
								style={{ width: "100%" }}
							>
								<span className="text-xs font-semibold">{stage.label}</span>
								<span className="ml-3 font-mono text-sm tabular-nums">{stage.count} órdenes</span>
								<span className="ml-3 text-xs opacity-80">{COP.format(stage.amount)}</span>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
