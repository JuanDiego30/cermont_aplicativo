import { type CostCategory, CostCategorySchema, type CostDataState } from "@cermont/shared-types";

export const COST_CATEGORY_OPTIONS = [...CostCategorySchema.options] as CostCategory[];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
	labor: "Mano de obra",
	materials: "Materiales",
	equipment: "Equipos",
	transport: "Transporte",
	subcontract: "Subcontratos",
	overhead: "Gastos generales",
	tax: "Impuestos",
	other: "Otros",
};

export function formatCurrency(value: number | null | undefined, currency: string = "COP"): string {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "Sin datos";
	}

	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function formatCurrencyForState(
	value: number | null | undefined,
	dataState?: CostDataState,
	currency: string = "COP",
): string {
	if (dataState === "NO_DATA") {
		return "Sin datos";
	}
	return formatCurrency(value, currency);
}

export function labelForCostDataState(dataState?: CostDataState): string {
	switch (dataState) {
		case "ESTIMATED_ONLY":
			return "Solo estimado";
		case "ACTUAL_ONLY":
			return "Solo real";
		case "ESTIMATED_AND_ACTUAL":
			return "Estimado y real";
		case "INVOICED":
			return "Facturado";
		case "PAID":
			return "Pagado";
		default:
			return "Sin datos";
	}
}

export function formatPercent(value: number | null | undefined): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "—";
	}

	return `${new Intl.NumberFormat("es-CO", {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value)}`;
}
