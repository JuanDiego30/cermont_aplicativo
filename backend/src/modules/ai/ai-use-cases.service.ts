/**
 * AI Use Cases — Low-risk, read-only AI operations
 *
 * T090: Three specific use cases that are safe, read-only operations:
 * 1. "Resumir caso" — summarize service case from its data
 * 2. "Buscar faltantes" — identify missing required documents
 * 3. "Redactar borrador" — draft technical report from execution data
 *
 * Each use case has a rule-based fallback when no AI provider is available.
 */

import type { CermontOperationalStepCode } from "@cermont/shared-types";
import { NotFoundError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { Document, Evidence, ExecutionSession, ServiceCase, TechnicalReport } from "../../models";

const _log = createLogger("ai-use-cases");

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CaseSummary {
	code: string;
	clientName: string;
	currentStep: string;
	currentStepLabel: string;
	createdAt: Date;
	status: string;
	totalDocuments: number;
	totalEvidence: number;
	hasTechnicalReport: boolean;
	summary: string;
}

export interface MissingDocument {
	step: string;
	stepLabel: string;
	required: string[];
	missing: string[];
	status: "complete" | "incomplete" | "not_reached";
}

export interface DraftReport {
	executionSession: {
		code: string;
		status: string;
		startedAt?: Date;
		completedAt?: Date;
	};
	activitiesPerformed: string[];
	findings: string[];
	deviations: string[];
	evidenceSummary: string;
	draftContent: string;
}

// ─── Use Case 1: Resumir Caso ──────────────────────────────────────────────

export async function summarizeServiceCase(serviceCaseId: string): Promise<CaseSummary> {
	const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const sc = serviceCase as unknown as Record<string, unknown>;
	const code = (sc.code as string) || "";
	const clientName = (sc.clientName as string) || "N/A";
	const currentStepCode = ((sc.currentStepCode as string) ||
		"step_01_work_request") as CermontOperationalStepCode;
	const normalizedCurrent = currentStepCode.startsWith("step_")
		? currentStepCode.split("_").slice(2).join("_")
		: currentStepCode;

	const stepLabels: Record<string, string> = {
		work_request: "Solicitud de Trabajo",
		site_visit: "Visita Técnica",
		proposal: "Cotización",
		purchase_order: "Orden de Compra",
		planning: "Planificación",
		execution: "Ejecución",
		technical_report: "Informe Técnico",
		delivery_record: "Acta de Entrega",
		acceptance: "Aceptación",
		ses: "SES",
		ses_approval: "Aprobación SES",
		invoice: "Facturación",
		invoice_approval: "Aprobación Factura",
		payment: "Pago",
	};

	const stepLabel = stepLabels[normalizedCurrent] || normalizedCurrent;

	// Count related data
	const documentCount = await Document.countDocuments({
		$or: [{ linkedEntityId: serviceCaseId }, { serviceCaseId }],
	});

	const evidenceCount = await Evidence.countDocuments({
		$or: [{ serviceCaseId }, { linkedEntityId: serviceCaseId }],
	});

	const reportCount = await TechnicalReport.countDocuments({
		serviceCaseId,
	});

	const summary = buildRuleBasedSummary(code, clientName, stepLabel, {
		documents: documentCount,
		evidence: evidenceCount,
		hasReport: reportCount > 0,
	});

	return {
		code,
		clientName,
		currentStep: currentStepCode,
		currentStepLabel: stepLabel,
		createdAt: (sc.createdAt as Date) || new Date(),
		status: (sc.status as string) || "active",
		totalDocuments: documentCount,
		totalEvidence: evidenceCount,
		hasTechnicalReport: reportCount > 0,
		summary,
	};
}

function buildRuleBasedSummary(
	code: string,
	clientName: string,
	stepLabel: string,
	stats: { documents: number; evidence: number; hasReport: boolean },
): string {
	const parts: string[] = [
		`**Caso:** ${code}`,
		`**Cliente:** ${clientName}`,
		`**Paso actual:** ${stepLabel}`,
		`**Documentos:** ${stats.documents} adjuntos`,
		`**Evidencias:** ${stats.evidence} registros`,
	];

	if (stats.hasReport) {
		parts.push("**Informe técnico:** Generado");
	} else {
		parts.push("**Informe técnico:** Pendiente");
	}

	return parts.join("  \n");
}

// ─── Use Case 2: Buscar Faltantes ──────────────────────────────────────────

export async function findMissingDocuments(serviceCaseId: string): Promise<MissingDocument[]> {
	const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const sc = serviceCase as unknown as Record<string, unknown>;
	const currentStepCode = ((sc.currentStepCode as string) ||
		"step_01_work_request") as CermontOperationalStepCode;
	const normalizedCurrent = currentStepCode.startsWith("step_")
		? currentStepCode.split("_").slice(2).join("_")
		: currentStepCode;

	const stepLabels: Record<string, string> = {
		work_request: "Solicitud de Trabajo",
		site_visit: "Visita Técnica",
		proposal: "Cotización",
		purchase_order: "Orden de Compra",
		planning: "Planificación",
		execution: "Ejecución",
		technical_report: "Informe Técnico",
		delivery_record: "Acta de Entrega",
		acceptance: "Aceptación",
		ses: "SES",
		ses_approval: "Aprobación SES",
		invoice: "Facturación",
		invoice_approval: "Aprobación Factura",
		payment: "Pago",
	};

	// Define required documents per step
	const stepRequirements: Record<string, string[]> = {
		work_request: ["Solicitud firmada", "Documento del cliente"],
		site_visit: ["Registro de visita", "Fotos del sitio"],
		proposal: ["Cotización detallada", "Hoja de vida del personal"],
		purchase_order: ["Orden de compra firmada", "Certificado de disponibilidad presupuestal"],
		planning: ["Plan de trabajo", "Cronograma", "Lista de verificación HES"],
		execution: ["Permiso de trabajo", "AST analizado", "Checklist de pre-ejecución"],
		technical_report: ["Informe técnico", "Registro fotográfico", "Resultados de pruebas"],
		delivery_record: ["Acta de entrega firmada", "Documentos de satisfacción del cliente"],
		acceptance: ["Certificado de aceptación", "Garantía"],
		ses: ["SES diligenciado", "Soportes de ejecución"],
		ses_approval: ["SES aprobado", "Comprobante de aprobación"],
		invoice: ["Factura electrónica", "Soporte DIAN"],
		invoice_approval: ["Factura aprobada", "Comprobante de contabilidad"],
		payment: ["Comprobante de pago", "Paz y salvo"],
	};

	const result: MissingDocument[] = [];
	const steps = Object.keys(stepLabels);
	const currentIdx = steps.indexOf(normalizedCurrent);

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const required = stepRequirements[step] || [];
		const isCurrentOrPast = i <= currentIdx;

		if (!isCurrentOrPast) {
			result.push({
				step,
				stepLabel: stepLabels[step],
				required,
				missing: [],
				status: "not_reached",
			});
			continue;
		}

		// Check documents for this step via the artifacts system
		const artifacts = (sc.artifacts as unknown as Record<string, unknown>) || {};
		const artifact = artifacts[step === "work_request" ? "workRequest" : step] as unknown as
			| Record<string, unknown>
			| undefined;

		const missing: string[] = [];

		if (
			!artifact ||
			(artifact.status as string) === "pending" ||
			(artifact.status as string) === "missing"
		) {
			missing.push(...required.slice(0, 2));
		}

		result.push({
			step,
			stepLabel: stepLabels[step],
			required,
			missing,
			status: missing.length > 0 ? "incomplete" : "complete",
		});
	}

	return result;
}

// ─── Use Case 3: Redactar Borrador ─────────────────────────────────────────

export async function draftTechnicalReport(
	serviceCaseId: string,
	executionSessionId?: string,
): Promise<DraftReport> {
	const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const sc = serviceCase as unknown as Record<string, unknown>;
	const orderId = (sc.workOrderId as { toString?: () => string })?.toString?.() || "";

	const execution = await resolveExecutionSession(serviceCaseId, executionSessionId, orderId);

	const existingReport = await checkExistingTechnicalReport(serviceCaseId);
	if (existingReport && !executionSessionId) {
		return existingReport;
	}

	if (!execution) {
		return {
			executionSession: { code: "", status: "" },
			activitiesPerformed: [],
			findings: [],
			deviations: [],
			evidenceSummary: "",
			draftContent: buildDraftTemplate(sc),
		};
	}

	const exec = execution as unknown as Record<string, unknown>;
	const extracted = extractExecutionDraftData(exec);
	const draftContent = buildDraftReportContent(sc, exec, extracted);

	return {
		executionSession: {
			code: (exec.code as string) || "",
			status: (exec.status as string) || "",
			startedAt: exec.startedAt as Date | undefined,
			completedAt: exec.completedAt as Date | undefined,
		},
		...extracted,
		draftContent,
	};
}

async function resolveExecutionSession(
	serviceCaseId: string,
	executionSessionId?: string,
	orderId?: string,
): Promise<Record<string, unknown> | null> {
	const executionQuery: Record<string, unknown> = {};
	if (executionSessionId) {
		executionQuery._id = executionSessionId;
	} else if (orderId) {
		executionQuery.workOrderId = orderId;
	} else {
		executionQuery.serviceCaseId = serviceCaseId;
	}
	return ExecutionSession.findOne(
		executionQuery as unknown as Record<string, unknown>,
	)
		.sort({ createdAt: -1 })
		.lean() as unknown as Promise<Record<string, unknown> | null>;
}

async function checkExistingTechnicalReport(
	serviceCaseId: string,
): Promise<DraftReport | null> {
	const existingReport = await TechnicalReport.findOne({ serviceCaseId })
		.sort({ createdAt: -1 })
		.lean();
	if (!existingReport) {
		return null;
	}
	const report = existingReport as unknown as Record<string, unknown>;
	return {
		executionSession: {
			code: "",
			status: "",
		},
		activitiesPerformed: (report.activitiesPerformed as string[]) || [],
		findings: (report.findings as string[]) || [],
		deviations: (report.deviations as string[]) || [],
		evidenceSummary: "",
		draftContent: `Ya existe un informe técnico para este caso (${(report.code as string) || ""}). Puedes revisarlo y editarlo directamente.`,
	};
}

function extractExecutionDraftData(exec: Record<string, unknown>): {
	activitiesPerformed: string[];
	findings: string[];
	deviations: string[];
	evidenceSummary: string;
} {
	const activities = (exec.checklistResponses as Array<Record<string, unknown>>) || [];
	const incidents = (exec.incidents as Array<Record<string, unknown>>) || [];
	const observations = (exec.observations as Array<Record<string, unknown>>) || [];

	const activitiesPerformed = activities
		.filter(
			(a: Record<string, unknown>) => (a.value as string) && String(a.value).trim().length > 0,
		)
		.map((a: Record<string, unknown>) => `${(a.label as string) || ""}: ${String(a.value || "")}`);

	const findings = observations
		.map((o: Record<string, unknown>) => o.description as string)
		.filter(Boolean);

	const deviations = incidents
		.filter((i: Record<string, unknown>) => i.resolved === false)
		.map((i: Record<string, unknown>) => `[${i.severity as string}] ${i.description as string}`);

	const evidenceCount = (exec.evidenceIds as Array<unknown>)?.length || 0;
	const evidenceSummary = `${evidenceCount} registro(s) de evidencia adjunto(s) durante la ejecución.`;

	return { activitiesPerformed, findings, deviations, evidenceSummary };
}

function extractDraftMaterials(exec: Record<string, unknown>): string[] {
	const materials = (exec.materialsUsed as Array<Record<string, unknown>>) || [];
	if (materials.length === 0) {
		return ["- Sin materiales registrados."];
	}
	return materials.map(
		(m: Record<string, unknown>) =>
			`- ${(m.name as string) || ""}: ${String(m.quantityUsed ?? "")} ${(m.unit as string) || ""}`,
	);
}

function buildDraftReportContent(
	sc: Record<string, unknown>,
	exec: Record<string, unknown>,
	data: { activitiesPerformed: string[]; findings: string[]; deviations: string[]; evidenceSummary: string },
): string {
	return [
		`# INFORME TÉCNICO — Borrador`,
		``,
		`**Caso:** ${(sc.code as string) || ""}`,
		`**Cliente:** ${(sc.clientName as string) || ""}`,
		`**Ejecución:** ${(exec.code as string) || "N/A"} | Estado: ${(exec.status as string) || "desconocido"}`,
		``,
		`## Resumen de Ejecución`,
		`${buildExecutionSummary(exec)}`,
		``,
		`## Actividades Realizadas`,
		...(data.activitiesPerformed.length > 0
			? data.activitiesPerformed.map((a: string) => `- ${a}`)
			: ["- No se registraron actividades específicas."]),
		``,
		`## Hallazgos y Observaciones`,
		...(data.findings.length > 0
			? data.findings.map((f: string) => `- ${f}`)
			: ["- Sin observaciones registradas."]),
		``,
		`## Desviaciones / Incidentes`,
		...(data.deviations.length > 0
			? data.deviations.map((d: string) => `- ${d}`)
			: ["- Sin desviaciones reportadas."]),
		``,
		`## Materiales Utilizados`,
		...(extractDraftMaterials(exec)),
		``,
		`## Evidencias`,
		`${data.evidenceSummary}`,
		``,
		`---`,
		`*Borrador generado por Cermont AI el ${new Date().toLocaleDateString("es-CO")}.*`,
		`*Este es un borrador automático. Revisa y ajusta antes de finalizar.*`,
	].join("\n");
}

function buildExecutionSummary(exec: Record<string, unknown>): string {
	const parts: string[] = [];

	if (exec.startedAt) {
		const startDate = new Date(exec.startedAt as string | Date);
		parts.push(`Inicio: ${startDate.toLocaleDateString("es-CO")}`);
	}
	if (exec.completedAt) {
		const endDate = new Date(exec.completedAt as string | Date);
		parts.push(`Fin: ${endDate.toLocaleDateString("es-CO")}`);
	}
	if (exec.assignedCrew) {
		const crew = exec.assignedCrew as unknown[];
		parts.push(`Personal asignado: ${crew.length} persona(s)`);
	}

	return parts.length > 0 ? parts.join(" | ") : "No hay datos de ejecución disponibles.";
}

function buildDraftTemplate(sc: Record<string, unknown>): string {
	return [
		`# INFORME TÉCNICO — Borrador`,
		``,
		`**Caso:** ${(sc.code as string) || ""}`,
		`**Cliente:** ${(sc.clientName as string) || ""}`,
		``,
		`## Resumen de Ejecución`,
		`No hay datos de ejecución disponibles para este caso.`,
		``,
		`## Actividades Realizadas`,
		`- *(Pendiente de registro)*`,
		``,
		`## Hallazgos y Observaciones`,
		`- *(Pendiente)*`,
		``,
		`## Desviaciones / Incidentes`,
		`- *(Pendiente)*`,
		``,
		`---`,
		`*Borrador generado por Cermont AI el ${new Date().toLocaleDateString("es-CO")}.*`,
		`*Completa la ejecución del caso para generar un borrador con datos reales.*`,
	].join("\n");
}

export function isHumanReviewRequired(prompt: string): boolean {
	// Document generation requests require human review
	const humanReviewKeywords = [
		"generar informe",
		"crear informe",
		"redactar informe",
		"emitir",
		"aprobar",
		"firmar",
		"enviar factura",
		"modificar",
		"eliminar",
		"borrar",
	];

	const lower = prompt.toLowerCase();
	return humanReviewKeywords.some((kw) => lower.includes(kw));
}
