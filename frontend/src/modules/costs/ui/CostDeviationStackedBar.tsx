"use client";

interface CategoryDeviation {
	category: string;
	estimated: number;
	actual: number;
}

interface Props {
	data: CategoryDeviation[];
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function CostDeviationStackedBar({ data }: Props) {
	if (data.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
				Sin datos de desviación de costos
			</p>
		);
	}

	const maxValue = Math.max(...data.flatMap((d) => [d.estimated, d.actual]), 1);

	return (
		<div className="space-y-3">
			{data.map((item) => {
				const deviation =
					item.estimated > 0 ? ((item.actual - item.estimated) / item.estimated) * 100 : 0;
				const estimatedPct = (item.estimated / maxValue) * 100;
				const actualPct = (item.actual / maxValue) * 100;

				return (
					<div key={item.category}>
						<div className="mb-1 flex items-center justify-between text-xs">
							<span className="font-medium capitalize text-[var(--text-primary)]">
								{item.category}
							</span>
							<span
								className={`tabular-nums ${Math.abs(deviation) > 20 ? "text-[#F44336] font-semibold" : "text-[var(--text-secondary)]"}`}
							>
								{deviation > 0 ? "+" : ""}
								{deviation.toFixed(1)}%
							</span>
						</div>
						<div className="flex gap-1">
							<div
								className="flex h-5 items-center rounded bg-blue-200 px-2 text-xs font-medium text-blue-900"
								style={{ width: `${Math.max(estimatedPct, 2)}%`, minWidth: 60 }}
							>
								Est. {COP.format(item.estimated)}
							</div>
							<div
								className="flex h-5 items-center rounded bg-[var(--color-brand-blue)] px-2 text-xs font-medium text-white"
								style={{ width: `${Math.max(actualPct, 2)}%`, minWidth: 60 }}
							>
								Real {COP.format(item.actual)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
