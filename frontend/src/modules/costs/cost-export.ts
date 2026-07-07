import type { Cost, CostSummary } from "@cermont/shared-types";

function csvCell(value: string | number): string {
	const normalized = String(value);
	return /[",\n\r]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
}

function statusValue(value: { status: "absent" } | { status: "present"; value: number }): string {
	return value.status === "present" ? String(value.value) : "NO_DISPONIBLE";
}

export function buildCostExportCsv(summary: CostSummary, costs: readonly Cost[]): string {
	const summaryRows = [
		["Orden", summary.orderId],
		["Presupuesto aprobado", statusValue(summary.approvedBudget)],
		["Costo estimado", summary.totalEstimated],
		["Costo real", summary.totalActual],
		["Impuestos", summary.totalTax],
		["Costo real con impuestos", summary.actualCostWithTax],
		["Utilidad bruta", statusValue(summary.grossProfit)],
		[
			"Margen bruto",
			summary.grossMarginPercent.status === "present"
				? `${(summary.grossMarginPercent.value * 100).toFixed(2)}%`
				: "NO_DISPONIBLE",
		],
		["Riesgo presupuestal", summary.budgetRisk],
	];
	const detailHeader = [
		"Categoría",
		"Descripción",
		"Estimado",
		"Real",
		"Impuestos",
		"Moneda",
		"Soportes",
	];
	const detailRows = costs.map((cost) => [
		cost.category,
		cost.description,
		cost.estimatedAmount,
		cost.actualAmount,
		cost.taxAmount,
		cost.currency,
		cost.supportEvidenceIds.length + cost.supportDocumentIds.length,
	]);

	return [
		...summaryRows.map((row) => row.map(csvCell).join(",")),
		"",
		detailHeader.map(csvCell).join(","),
		...detailRows.map((row) => row.map(csvCell).join(",")),
	].join("\r\n");
}

export function downloadCostExport(summary: CostSummary, costs: readonly Cost[]): void {
	const blob = new Blob([buildCostExportCsv(summary, costs)], {
		type: "text/csv;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `costos-${summary.orderId}.csv`;
	anchor.click();
	URL.revokeObjectURL(url);
}
