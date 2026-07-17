export const PIPELINE_STAGES = [
	"work_request",
	"site_visit",
	"proposal",
	"purchase_order",
	"planning",
	"execution",
	"technical_report",
	"delivery_record",
	"client_signature",
	"ses",
	"ses_approval",
	"invoice",
	"invoice_approval",
	"payment",
	"closure",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

const COMPLETED_VALUES: PipelineStage[] = ["closure", "payment"];

const TERMINAL_VALUES: PipelineStage[] = ["closure", "payment"];

export function getAllPipelineStages(): PipelineStage[] {
	return [...PIPELINE_STAGES];
}

export function getPipelineStageOrder(stage: PipelineStage): number {
	return PIPELINE_STAGES.indexOf(stage);
}

export function getPipelineStageLabel(stage: PipelineStage): string {
	const labels: Record<PipelineStage, string> = {
		work_request: "Solicitud",
		site_visit: "Visita técnica",
		proposal: "Propuesta",
		purchase_order: "Orden de compra",
		planning: "Planeación",
		execution: "Ejecución",
		technical_report: "Informe técnico",
		delivery_record: "Acta de entrega",
		client_signature: "Firma del cliente",
		ses: "SES",
		ses_approval: "Aprobación SES",
		invoice: "Factura",
		invoice_approval: "Aprobación factura",
		payment: "Pago",
		closure: "Cierre",
	};
	return labels[stage] ?? stage;
}

export function isClosureStage(stage: PipelineStage): boolean {
	return COMPLETED_VALUES.includes(stage);
}

export function isTerminalStage(stage: PipelineStage): boolean {
	return TERMINAL_VALUES.includes(stage);
}

export function computeCompletionRate(currentStage: PipelineStage): number {
	const idx = PIPELINE_STAGES.indexOf(currentStage);
	if (idx < 0) {
		return 0;
	}
	return Math.round((idx / (PIPELINE_STAGES.length - 1)) * 100);
}

export type SlaRiskClass = "low" | "medium" | "high" | "critical";

export function computeSlaRiskClass(daysRemaining: number, daysTotal: number): SlaRiskClass {
	if (daysTotal <= 0) {
		return "critical";
	}
	const ratio = daysRemaining / daysTotal;
	if (ratio <= 0) {
		return "critical";
	}
	if (ratio <= 0.25) {
		return "high";
	}
	if (ratio <= 0.5) {
		return "medium";
	}
	return "low";
}
