/**
 * Document Ingestion Service
 *
 * Converts an uploaded document into a TemplateDraft structure.
 * Implements persistent ingestion pipeline creating DocumentExtractionJob and TemplateDraft.
 */

import {
	type CermontOperationalStepCode,
	type IngestDocumentRequest,
	isClosingEvidencePurpose,
	isLibraryOnlyPurpose,
	resolveDocumentIngestPurpose,
	shouldCreateTemplateDraft,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { AppError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import {
	Document,
	DocumentExtractionJob,
	type IDocumentExtractionJobDocument,
	TemplateDraft,
} from "../../models";
import type { IDocument } from "../../models/Document";
import { applyClosingEvidenceMetadata } from "../../services/closing-evidence-routing.service";

const log = createLogger("document-ingestion-service");

type DetectedField = ReturnType<typeof buildDetectedFields>[number];
type DetectedTable = ReturnType<typeof buildDetectedTables>[number];
type IngestionStatus = "draft" | "review_required";

export interface IngestResult {
	documentId: string;
	status: string;
	draftId: string | null;
	detectedFields: number;
	message: string;
	targetStepCode?: CermontOperationalStepCode;
	classification?: IDocument["closingEvidenceKind"];
}

function normalizeLinkedEntityType(
	linkedEntityType: IngestDocumentRequest["linkedEntityType"],
): IDocument["linkedEntityType"] {
	switch (linkedEntityType) {
		case "asset":
		case "delivery_record":
		case "invoice":
		case "payment":
		case "proposal":
		case "purchase_order":
		case "service_case":
		case "site_visit":
		case "work_request":
			return linkedEntityType;
		case "execution_session":
			return "execution";
		case "maintenance_event":
			return "maintenance";
		case "planning_packet":
			return "planning";
		case "service_entry_sheet":
			return "ses";
		case "technical_report":
			return "report";
		case "work_order":
			return "order";
		default:
			return undefined;
	}
}

function applyIngestionMetadata(document: IDocument, options: IngestDocumentRequest): void {
	document.purpose = options.purpose;

	if (options.targetStepCode) {
		document.targetStepCode = options.targetStepCode;
	}

	const linkedEntityType = normalizeLinkedEntityType(options.linkedEntityType);
	if (linkedEntityType) {
		document.linkedEntityType = linkedEntityType;
	}

	if (options.linkedEntityId) {
		document.linkedEntityId = new Types.ObjectId(options.linkedEntityId);
	}
}

function detectDocumentExtension(title: string, filename: string): string {
	const lastDotInTitle = title.lastIndexOf(".");
	if (lastDotInTitle !== -1) {
		return title.substring(lastDotInTitle).toLowerCase();
	}

	const lastDotInFileName = filename.lastIndexOf(".");
	if (lastDotInFileName !== -1) {
		return filename.substring(lastDotInFileName).toLowerCase();
	}

	return ".manual";
}

function resolveAdapter(
	requestedAdapter: IngestDocumentRequest["adapter"],
	extension: string,
): IDocumentExtractionJobDocument["adapter"] {
	if (requestedAdapter) {
		return requestedAdapter;
	}
	if (extension === ".xlsx" || extension === ".xls") {
		return "sheetjs";
	}
	if (extension === ".pdf") {
		return "pdf_basic";
	}
	if (extension === ".docx") {
		return "docling_sidecar";
	}
	return "manual";
}

const FIELD_KIND_RULES: { keywords: string[]; kind: inferFieldKindReturn }[] = [
	{ keywords: ["fecha", "date"], kind: "date" },
	{ keywords: ["firma", "signature"], kind: "signature" },
	{ keywords: ["gps", "coordenadas"], kind: "gps" },
	{ keywords: ["foto", "photo"], kind: "photo" },
	{ keywords: ["valor", "costo", "precio"], kind: "currency" },
	{ keywords: ["cantidad", "numero", "horas"], kind: "number" },
	{ keywords: ["adjunto", "archivo"], kind: "file" },
	{ keywords: ["checklist"], kind: "checklist" },
	{ keywords: ["multiple", "opciones"], kind: "multi_select" },
	{ keywords: ["cumple", "estado"], kind: "select" },
	{ keywords: ["observacion", "descripcion", "hallazgo"], kind: "textarea" },
];

type inferFieldKindReturn =
	| "checklist"
	| "currency"
	| "date"
	| "file"
	| "gps"
	| "multi_select"
	| "number"
	| "photo"
	| "select"
	| "signature"
	| "text"
	| "textarea";

function inferFieldKind(name: string): inferFieldKindReturn {
	const lower = name.toLowerCase();
	for (const rule of FIELD_KIND_RULES) {
		if (rule.keywords.some((k) => lower.includes(k))) {
			return rule.kind;
		}
	}
	return "text";
}

function buildDetectedFields(detectedFieldNames: string[]) {
	return detectedFieldNames.map((name, index) => {
		const fieldKind = inferFieldKind(name);
		return {
			fieldId: `field_${index + 1}`,
			label: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
			normalizedName: name.toLowerCase().replace(/[^a-z0-9_]/g, ""),
			fieldKind,
			required: true,
			order: index,
			confidence: 0.9,
			options:
				fieldKind === "select"
					? ["cumple", "no_cumple", "no_aplica"]
					: fieldKind === "multi_select" || fieldKind === "checklist"
						? ["si", "no", "no_aplica"]
						: [],
			allowOtherOption: fieldKind === "select" || fieldKind === "multi_select",
			otherOptionLabel:
				fieldKind === "select" || fieldKind === "multi_select" ? "Otro, ¿cuál?" : undefined,
			validationRules: [],
			helpText: `Ingrese el valor para ${name}`,
			placeholder: `Registrar ${name.replace(/_/g, " ")}`,
			sourceReference: `Layout block ${index + 1}`,
		};
	});
}

function buildDetectedTables(adapter: IDocumentExtractionJobDocument["adapter"]) {
	if (adapter !== "sheetjs") {
		return [];
	}

	return [
		{
			tableId: "tbl_items",
			title: "Registro de Actividades / Mediciones",
			description: "Tabla de control operacional identificada.",
			columns: [
				{
					columnId: "col_1",
					name: "Ítem",
					fieldKind: "text",
					required: true,
					options: [],
					width: "80px",
				},
				{
					columnId: "col_2",
					name: "Descripción",
					fieldKind: "text",
					required: true,
					options: [],
					width: "250px",
				},
				{
					columnId: "col_3",
					name: "Estado de Cumplimiento",
					fieldKind: "select",
					required: true,
					options: ["conforme", "no_conforme"],
					width: "150px",
				},
			],
			allowAddRows: true,
			allowDeleteRows: true,
			sourceReference: "Sheet1 A10:C25",
		},
	];
}

function splitDraftFields(fields: DetectedField[]): [DetectedField[], DetectedField[]] {
	const detailFieldNames = ["observaciones", "firma", "firma_cliente", "firma_tecnico"];

	return [
		fields.filter((field) => !detailFieldNames.includes(field.normalizedName)),
		fields.filter((field) => detailFieldNames.includes(field.normalizedName)),
	];
}

function mapStepCodeToTargetStage(stepCode: CermontOperationalStepCode | undefined): string[] {
	if (!stepCode) {
		return [];
	}

	const stageMap: Record<CermontOperationalStepCode, string> = {
		step_01_work_request: "work_request",
		step_02_site_visit: "site_visit",
		step_03_proposal: "proposal",
		step_04_purchase_order: "purchase_order",
		step_05_planning: "planning",
		step_06_execution: "execution",
		step_07_technical_report: "technical_report",
		step_08_delivery_record: "delivery_record",
		step_09_client_signature: "delivery_record",
		step_10_ses_submission: "service_entry_sheet",
		step_11_ses_approval: "service_entry_sheet",
		step_12_invoice_submission: "invoice",
		step_13_invoice_approval: "invoice",
		step_14_payment_closure: "payment",
	};

	return [stageMap[stepCode]];
}

function evaluateExtractionConfidence(
	title: string,
	adapter: IDocumentExtractionJobDocument["adapter"],
): {
	confidence: number;
	requiresReview: boolean;
	status: IngestionStatus;
} {
	const normalizedTitle = title.toLowerCase();
	const isScanned =
		normalizedTitle.includes("scanned") ||
		normalizedTitle.includes("escaneado") ||
		normalizedTitle.includes("imagen") ||
		adapter === "manual";
	const confidence = isScanned ? 0.65 : 0.88;

	return {
		confidence,
		requiresReview: confidence < 0.8,
		status: confidence < 0.8 ? "review_required" : "draft",
	};
}

function buildStoredResult(
	documentId: string,
	purpose: IngestDocumentRequest["purpose"],
	options?: Partial<IngestResult>,
): IngestResult {
	return {
		documentId,
		status: "stored_with_purpose",
		draftId: null,
		detectedFields: 0,
		message: `Document stored successfully with purpose: ${purpose}.`,
		...options,
	};
}

function buildDraftContent(
	title: string,
	adapter: IDocumentExtractionJobDocument["adapter"],
	targetStepCode?: CermontOperationalStepCode,
): {
	confidence: number;
	fields: DetectedField[];
	requiresReview: boolean;
	status: IngestionStatus;
	tables: DetectedTable[];
} {
	const detectedFieldNames = detectBasicFields(title, targetStepCode);
	const fields = buildDetectedFields(detectedFieldNames);
	const tables = buildDetectedTables(adapter);

	return {
		fields,
		tables,
		...evaluateExtractionConfidence(title, adapter),
	};
}

function buildDraftSections(
	fields: DetectedField[],
	tables: DetectedTable[],
	targetStepCode?: CermontOperationalStepCode,
) {
	const [headerFields, detailFields] = splitDraftFields(fields);

	if (targetStepCode === "step_06_execution") {
		return [
			{
				sectionId: "sec_execution_context",
				title: "Contexto de Ejecución",
				description: "Datos operativos mínimos del frente de trabajo y el permiso asociado.",
				order: 1,
				fields: headerFields,
				tables: [],
				repeatable: false,
				required: true,
				sourceReference: "Execution header",
			},
			{
				sectionId: "sec_execution_control",
				title: "Control de Actividades",
				description: "Registros de actividades, cantidades, consumos y checklist operacional.",
				order: 2,
				fields: detailFields,
				tables,
				repeatable: false,
				required: true,
				sourceReference: "Execution control",
			},
		];
	}

	if (
		targetStepCode === "step_08_delivery_record" ||
		targetStepCode === "step_09_client_signature"
	) {
		return [
			{
				sectionId: "sec_delivery_summary",
				title: "Resumen de Entrega",
				description: "Acta técnica, observaciones del cliente y conformidad de entrega.",
				order: 1,
				fields,
				tables: [],
				repeatable: false,
				required: true,
				sourceReference: "Delivery layout",
			},
		];
	}

	return [
		{
			sectionId: "sec_header",
			title: "Información General",
			description: "Datos principales identificados en la cabecera del documento.",
			order: 1,
			fields: headerFields,
			tables,
			repeatable: false,
			required: true,
			sourceReference: "Header block",
		},
		{
			sectionId: "sec_details",
			title: "Cierre y Firmas",
			description: "Registros de cierre, firmas y observaciones de control.",
			order: 2,
			fields: detailFields,
			tables: [],
			repeatable: false,
			required: true,
			sourceReference: "Footer block",
		},
	];
}

/**
 * Ingest a document and create a template draft
 */
export async function ingestDocument(
	documentId: string,
	userId: string,
	options: IngestDocumentRequest,
): Promise<IngestResult> {
	const doc = await Document.findById(documentId);
	if (!doc) {
		throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
	}

	const purpose = resolveDocumentIngestPurpose(options);
	const { adapter: requestedAdapter, targetStepCode } = options;
	const title = doc.title ?? "Untitled";
	const filename = doc.file_url ?? "";

	log.info("Starting ingestion pipeline for document", {
		documentId,
		title,
		purpose,
		mode: options.mode,
		targetStepCode,
	});

	applyIngestionMetadata(doc, { ...options, purpose });
	await doc.save();

	if (isClosingEvidencePurpose(purpose)) {
		const routing = applyClosingEvidenceMetadata(doc, {
			serviceCaseId:
				options.linkedEntityType === "service_case" ? options.linkedEntityId : undefined,
			targetStepCode,
		});
		await doc.save();

		return buildStoredResult(documentId, purpose, {
			status: "closing_evidence_routed",
			targetStepCode: routing.targetStepCode,
			classification: routing.classification,
			message: `Closing evidence routed to ${routing.targetStepCode ?? "manual_review"}.`,
		});
	}

	if (isLibraryOnlyPurpose(purpose)) {
		return buildStoredResult(documentId, purpose, {
			targetStepCode,
		});
	}

	if (!shouldCreateTemplateDraft(purpose)) {
		return buildStoredResult(documentId, purpose, {
			targetStepCode,
			message: `Document stored successfully with purpose: ${purpose}.`,
		});
	}

	const extension = detectDocumentExtension(title, filename);
	const adapter = resolveAdapter(requestedAdapter, extension);

	const job = await DocumentExtractionJob.create({
		documentSourceFileId: new Types.ObjectId(documentId),
		adapter,
		status: "processing",
		startedAt: new Date(),
		retryCount: 0,
		requiresHumanReview: false,
		createdBy: new Types.ObjectId(userId),
	});

	try {
		const draftContent = buildDraftContent(title, adapter, targetStepCode);
		const sections = buildDraftSections(draftContent.fields, draftContent.tables, targetStepCode);

		const draft = await TemplateDraft.create({
			documentSourceFileId: new Types.ObjectId(documentId),
			extractionJobId: job._id,
			name: `Plantilla - ${title.replace(/\.[^/.]+$/, "")}`,
			description:
				`Borrador de plantilla generado mediante heurísticas de estructura sobre ${title}. ` +
				`Requiere revisión humana antes de publicarse.`,
			serviceTypes: [],
			targetStages: mapStepCodeToTargetStage(targetStepCode),
			targetStepCode: targetStepCode || "step_06_execution",
			sections,
			tables: draftContent.tables,
			rules: [],
			exportHints: [
				{
					format: "pdf",
					orientation: "portrait",
					pageSize: "Letter",
					showHeader: true,
					showFooter: true,
					showLogo: true,
					showPageNumbers: true,
				},
			],
			confidence: draftContent.confidence,
			status: draftContent.status,
			createdBy: new Types.ObjectId(userId),
		});

		job.status = "completed";
		job.finishedAt = new Date();
		job.confidence = draftContent.confidence;
		job.requiresHumanReview = draftContent.requiresReview;
		await job.save();

		log.info("Document ingestion successfully completed", {
			documentId,
			jobId: job._id,
			draftId: draft._id,
			requiresReview: draftContent.requiresReview,
		});

		return {
			documentId,
			status: "template_draft_created",
			draftId: draft._id.toString(),
			detectedFields: draftContent.fields.length,
			targetStepCode: targetStepCode || "step_06_execution",
			message: `Template draft created with ${draftContent.fields.length} fields. Status: ${draftContent.status}.`,
		};
	} catch (error) {
		job.status = "failed";
		job.finishedAt = new Date();
		job.errorCode = "EXTRACTION_FAILED";

		const message = error instanceof Error ? error.message : "Unknown error during parsing";
		job.errorMessage = message;
		await job.save();

		log.error("Failed to ingest document", { documentId, error: message });
		throw new AppError(`Failed to ingest document: ${message}`, 500, "INGESTION_FAILED");
	}
}

/**
 * Basic field detection from document title
 */
function detectBasicFields(title: string, targetStepCode?: CermontOperationalStepCode): string[] {
	const fields: string[] = [];
	const lowerTitle = title.toLowerCase();

	const keywordMap: Record<string, string[]> = {
		inspección: ["responsable", "lugar", "fecha", "observaciones", "firma_tecnico"],
		checklist: ["item", "estado_cumplimiento", "observaciones", "responsable", "fecha"],
		informe: ["titulo_obra", "descripcion", "responsable", "fecha", "firma_residente"],
		acta: ["cliente", "fecha", "descripcion_entrega", "firma_cliente", "firma_tecnico"],
		mantenimiento: ["equipo", "tipo_tarea", "responsable", "fecha", "observaciones"],
		entrega: ["cliente", "direccion", "fecha", "recibe", "firma_entrega"],
		seguridad: ["peligro_identificado", "riesgo", "medida_control", "responsable", "fecha"],
		calibración: ["equipo", "numero_certificado", "fecha", "resultado", "firma_calibrador"],
	};

	const stepPresets: Partial<Record<CermontOperationalStepCode, string[]>> = {
		step_06_execution: [
			"frente_trabajo",
			"actividad_ejecutada",
			"fecha",
			"checklist_ejecucion",
			"horas_hombre",
			"materiales_utilizados",
			"incidentes",
			"observaciones",
			"firma_tecnico",
			"firma_supervisor",
		],
		step_07_technical_report: [
			"objetivo",
			"alcance",
			"hallazgos",
			"resultado",
			"observaciones",
			"firma_residente",
		],
		step_08_delivery_record: [
			"cliente",
			"descripcion_entrega",
			"fecha_entrega",
			"observaciones_cliente",
			"firma_tecnico",
		],
		step_09_client_signature: ["cliente", "fecha_firma", "aceptacion_cliente", "firma_cliente"],
		step_10_ses_submission: [
			"ses_numero",
			"fecha_radicacion",
			"responsable_radicacion",
			"observaciones",
		],
		step_11_ses_approval: ["ses_numero", "fecha_aprobacion", "aprobado_por", "observaciones"],
		step_12_invoice_submission: [
			"numero_factura",
			"fecha_emision",
			"valor_factura",
			"moneda",
			"soporte_envio",
		],
		step_13_invoice_approval: [
			"numero_factura",
			"fecha_aprobacion",
			"aprobado_por",
			"observaciones",
		],
		step_14_payment_closure: [
			"referencia_pago",
			"fecha_pago",
			"valor_pago",
			"comprobante_pago",
			"observaciones",
		],
	};

	for (const [keyword, detected] of Object.entries(keywordMap)) {
		if (lowerTitle.includes(keyword)) {
			fields.push(...detected);
		}
	}

	if (targetStepCode && stepPresets[targetStepCode]) {
		fields.push(...stepPresets[targetStepCode]);
	}

	if (fields.length === 0) {
		fields.push("responsable", "fecha", "observaciones", "firma");
	}

	return [...new Set(fields)];
}
