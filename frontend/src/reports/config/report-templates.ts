import type { AnalyticsPeriod } from "@cermont/shared-types";

export type ReportTemplateId =
	| "monthly-operations"
	| "technician-performance"
	| "sla-compliance"
	| "client-costs"
	| "asset-history"
	| "field-summary";

export interface ReportTemplate {
	id: ReportTemplateId;
	name: string;
	description: string;
	period: AnalyticsPeriod;
	visibleCharts: Array<"cycle" | "technicians" | "billing">;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
	{
		id: "monthly-operations",
		name: "Operaciones mensual",
		description: "Cierre administrativo, volumen aprobado y margen del mes.",
		period: "30d",
		visibleCharts: ["cycle", "billing", "technicians"],
	},
	{
		id: "technician-performance",
		name: "Performance técnicos",
		description: "Ranking por aprobaciones y tiempo promedio de cierre.",
		period: "30d",
		visibleCharts: ["technicians", "cycle"],
	},
	{
		id: "sla-compliance",
		name: "Cumplimiento SLA",
		description: "Lectura ejecutiva de cuellos de botella y atraso.",
		period: "7d",
		visibleCharts: ["cycle", "technicians"],
	},
	{
		id: "client-costs",
		name: "Costos por cliente",
		description: "Comparativo facturable contra costo real registrado.",
		period: "90d",
		visibleCharts: ["billing"],
	},
	{
		id: "asset-history",
		name: "Historial activo",
		description: "Base para revisar tendencia por activo intervenido.",
		period: "90d",
		visibleCharts: ["cycle", "billing"],
	},
	{
		id: "field-summary",
		name: "Reporte campo simplificado",
		description: "Resumen corto para revisión rápida de operación.",
		period: "7d",
		visibleCharts: ["cycle"],
	},
];
