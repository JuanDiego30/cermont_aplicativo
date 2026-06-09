/**
 * ServiceCaseStepContext Service — Builds the accumulated data context for
 * operational steps by aggregating canonical case data, inherited fields from
 * previous steps, blockers, allowed actions, and linked entity IDs.
 *
 * Every step page consumes this context so it never asks for data from scratch.
 */

import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type DomainBlocker,
	type InheritedField,
	type ServiceCaseStepContext,
	type StepAllowedAction,
	StepContextQuerySchema,
	type StepRequiredField,
} from "@cermont/shared-types";
import { NotFoundError } from "../common/errors/AppError";
import { ServiceCase } from "../models";
import { calculateStepBlockers } from "./cermont-workflow-gate.service";

const NIL = Object.getPrototypeOf(Object.prototype);
type Undef = Parameters<(x?: never) => void>[0];

// ──────────────────────────────────────────────────────────────────────────────
// Step-to-step inheritance mapping
// Each entry defines what fields are inherited from which previous step.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps step codes to their immediately preceding step code.
 */
const PREVIOUS_STEP: Record<CermontOperationalStepCode, CermontOperationalStepCode | typeof NIL> = {
	step_01_work_request: NIL as never,
	step_02_site_visit: "step_01_work_request",
	step_03_proposal: "step_02_site_visit",
	step_04_purchase_order: "step_03_proposal",
	step_05_planning: "step_04_purchase_order",
	step_06_execution: "step_05_planning",
	step_07_technical_report: "step_06_execution",
	step_08_delivery_record: "step_07_technical_report",
	step_09_client_signature: "step_08_delivery_record",
	step_10_ses_submission: "step_09_client_signature",
	step_11_ses_approval: "step_10_ses_submission",
	step_12_invoice_submission: "step_11_ses_approval",
	step_13_invoice_approval: "step_12_invoice_submission",
	step_14_payment_closure: "step_13_invoice_approval",
};

/**
 * Step label lookup for source annotations.
 */
const STEP_LABELS: Record<CermontOperationalStepCode, string> = {
	step_01_work_request: "Solicitud de servicio",
	step_02_site_visit: "Visita técnica",
	step_03_proposal: "Propuesta económica",
	step_04_purchase_order: "Orden de compra",
	step_05_planning: "Planeación",
	step_06_execution: "Ejecución en campo",
	step_07_technical_report: "Informe técnico",
	step_08_delivery_record: "Acta de entrega",
	step_09_client_signature: "Firma del cliente",
	step_10_ses_submission: "Radicación SES",
	step_11_ses_approval: "Aprobación SES",
	step_12_invoice_submission: "Emisión factura",
	step_13_invoice_approval: "Aprobación factura",
	step_14_payment_closure: "Pago y cierre",
};

type ServiceCaseLeanObj = {
	clientId?: { toString(): string };
	clientName?: string;
	contactName?: string;
	contactPhone?: string;
	contactEmail?: string;
	siteId?: string;
	siteName?: string;
	location?: string;
	businessUnit?: string;
	workTypeId?: string;
	workTypeName?: string;
	priority?: string;
	requestedDate?: string | Date;
	generalScope?: string;
	artifacts?: Record<
		string,
		{ id?: { toString(): string }; code?: string; status?: string; updatedAt?: string | Date }
	>;
	createdAt?: Date;
};

// ──────────────────────────────────────────────────────────────────────────────
// Resolvers
// ──────────────────────────────────────────────────────────────────────────────

function resolveCanonicalCaseData(
	serviceCase: ServiceCaseLeanObj,
): ServiceCaseStepContext["canonical"] {
	return {
		clientId: serviceCase.clientId ? String(serviceCase.clientId) : void 0,
		clientName: serviceCase.clientName,
		contactName: serviceCase.contactName,
		contactPhone: serviceCase.contactPhone,
		contactEmail: serviceCase.contactEmail,
		siteId: serviceCase.siteId,
		siteName: serviceCase.siteName,
		location: serviceCase.location,
		businessUnit: serviceCase.businessUnit,
		workTypeId: serviceCase.workTypeId,
		workTypeName: serviceCase.workTypeName,
		priority: serviceCase.priority,
		requestedDate: serviceCase.requestedDate ? String(serviceCase.requestedDate) : void 0,
		generalScope: serviceCase.generalScope,
	};
}

/**
 * Helper to create an inherited field entry.
 */
function inherited(
	key: string,
	label: string,
	value: string,
	sourceStepCode: CermontOperationalStepCode,
	sourceEntityId: string,
	sourceStepLabel: string,
	editable = false,
	required = false,
): InheritedField {
	return { key, label, value, sourceStepCode, sourceEntityId, sourceStepLabel, editable, required };
}

/**
 * Helper to add a field if the value is truthy.
 */
function addField(
	fields: InheritedField[],
	value: string | number | boolean | Date | object | { toString(): string } | undefined,
	key: string,
	label: string,
	sourceStepCode: CermontOperationalStepCode,
	sourceEntityId: string,
	sourceStepLabel: string,
	editable = false,
	required = false,
): void {
	if (value) {
		fields.push(
			inherited(
				key,
				label,
				String(value),
				sourceStepCode,
				sourceEntityId,
				sourceStepLabel,
				editable,
				required,
			),
		);
	}
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-step inheritance resolvers (extracted to keep cognitive complexity low)
// ──────────────────────────────────────────────────────────────────────────────

type ArtifactRefs = {
	serviceCase: ServiceCaseLeanObj;
	wrId: string;
	svId: string;
	prId: string;
	poId: string;
	ppId: string;
	esId: string;
	trId: string;
	drId: string;
	sesId: string;
	invId: string;
	payId: string;
	sv?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	pr?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	po?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	pp?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	es?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	tr?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	dr?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	ses?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	inv?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
	pay?: { status?: string; id?: string | { toString(): string }; updatedAt?: string | Date };
};

function addWorkRequestBase(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientId,
		"clientId",
		"ID del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación / sitio",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.generalScope,
		"generalScope",
		"Alcance general",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.businessUnit,
		"businessUnit",
		"Unidad de negocio",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.priority,
		"priority",
		"Prioridad",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.requestedDate,
		"requestedDate",
		"Fecha requerida",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
}

function addFieldsForStep02(fields: InheritedField[], a: ArtifactRefs): void {
	addWorkRequestBase(fields, a);
}

function addFieldsForStep03(fields: InheritedField[], a: ArtifactRefs): void {
	addWorkRequestBase(fields, a);
	addField(
		fields,
		a.sv?.status,
		"technicalFindings",
		"Hallazgos técnicos",
		"step_02_site_visit",
		a.svId,
		"Visita técnica",
		true,
		false,
	);
	addField(
		fields,
		a.sv?.updatedAt,
		"visitDate",
		"Fecha de visita",
		"step_02_site_visit",
		a.svId,
		"Visita técnica",
		false,
		false,
	);
}

function addFieldsForStep04(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.pr?.id,
		"proposalId",
		"ID de propuesta",
		"step_03_proposal",
		a.prId,
		"Propuesta económica",
		false,
		true,
	);
	addField(
		fields,
		a.pr?.status,
		"proposalAmount",
		"Valor de propuesta",
		"step_03_proposal",
		a.prId,
		"Propuesta económica",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.generalScope,
		"generalScope",
		"Alcance",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
}

function addFieldsForStep05(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Sitio / ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.serviceCase.workTypeName,
		"workTypeName",
		"Tipo de trabajo",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
	addField(
		fields,
		a.po?.id,
		"purchaseOrderId",
		"ID de orden de compra",
		"step_04_purchase_order",
		a.poId,
		"Orden de compra",
		false,
		true,
	);
	addField(
		fields,
		a.po?.status,
		"poValue",
		"Valor aprobado",
		"step_04_purchase_order",
		a.poId,
		"Orden de compra",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.generalScope,
		"approvedScope",
		"Alcance aprobado",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.requestedDate,
		"requestedDate",
		"Fechas estimadas",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		false,
	);
}

function addFieldsForStep06(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.pp?.id,
		"planningPacketId",
		"ID de planeación",
		"step_05_planning",
		a.ppId,
		"Planeación",
		false,
		true,
	);
	addField(
		fields,
		a.pp?.status,
		"planningStatus",
		"Estado de planeación",
		"step_05_planning",
		a.ppId,
		"Planeación",
		false,
		false,
	);
	addField(
		fields,
		a.serviceCase.workTypeName,
		"workTypeName",
		"Tipo de trabajo",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		false,
	);
}

function addFieldsForStep07(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.es?.id,
		"executionSessionId",
		"ID de ejecución",
		"step_06_execution",
		a.esId,
		"Ejecución en campo",
		false,
		true,
	);
	addField(
		fields,
		a.es?.status,
		"executionStatus",
		"Estado de ejecución",
		"step_06_execution",
		a.esId,
		"Ejecución en campo",
		false,
		false,
	);
	addField(
		fields,
		a.serviceCase.generalScope,
		"generalScope",
		"Alcance del trabajo",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		false,
	);
}

function addFieldsForStep08(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.tr?.id,
		"technicalReportId",
		"ID de informe técnico",
		"step_07_technical_report",
		a.trId,
		"Informe técnico",
		false,
		true,
	);
	addField(
		fields,
		a.tr?.status,
		"reportStatus",
		"Estado del informe",
		"step_07_technical_report",
		a.trId,
		"Informe técnico",
		false,
		false,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
}

function addFieldsForStep09(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.dr?.id,
		"deliveryRecordId",
		"ID de acta de entrega",
		"step_08_delivery_record",
		a.drId,
		"Acta de entrega",
		false,
		true,
	);
	addField(
		fields,
		a.dr?.status,
		"deliveryStatus",
		"Estado del acta",
		"step_08_delivery_record",
		a.drId,
		"Acta de entrega",
		false,
		false,
	);
	addField(
		fields,
		a.dr?.updatedAt,
		"deliveryDate",
		"Fecha de entrega",
		"step_08_delivery_record",
		a.drId,
		"Acta de entrega",
		false,
		false,
	);
}

function addFieldsForStep10(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.dr?.status,
		"signedDeliveryStatus",
		"Acta firmada",
		"step_08_delivery_record",
		a.drId,
		"Acta de entrega",
		false,
		true,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
	addField(
		fields,
		a.po?.id,
		"poReference",
		"Referencia PO",
		"step_04_purchase_order",
		a.poId,
		"Orden de compra",
		false,
		false,
	);
}

function addFieldsForStep11(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.ses?.id,
		"sesId",
		"ID de SES",
		"step_10_ses_submission",
		a.sesId,
		"Radicación SES",
		false,
		true,
	);
	addField(
		fields,
		a.ses?.status,
		"sesStatus",
		"Estado SES",
		"step_10_ses_submission",
		a.sesId,
		"Radicación SES",
		false,
		false,
	);
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
}

function addFieldsForStep12(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		true,
		true,
	);
	addField(
		fields,
		a.ses?.id,
		"approvedSesId",
		"SES aprobada",
		"step_11_ses_approval",
		a.sesId,
		"Aprobación SES",
		false,
		true,
	);
	addField(
		fields,
		a.ses?.status,
		"sesAmount",
		"Valor SES",
		"step_11_ses_approval",
		a.sesId,
		"Aprobación SES",
		true,
		false,
	);
	addField(
		fields,
		a.po?.id,
		"poReference",
		"Referencia PO",
		"step_04_purchase_order",
		a.poId,
		"Orden de compra",
		false,
		false,
	);
	addField(
		fields,
		a.serviceCase.location,
		"location",
		"Ubicación",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
}

function addFieldsForStep13(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.inv?.id,
		"invoiceId",
		"ID de factura",
		"step_12_invoice_submission",
		a.invId,
		"Emisión factura",
		false,
		true,
	);
	addField(
		fields,
		a.inv?.status,
		"invoiceNumber",
		"Número de factura",
		"step_12_invoice_submission",
		a.invId,
		"Emisión factura",
		false,
		false,
	);
	addField(
		fields,
		a.inv?.updatedAt,
		"invoiceAmount",
		"Valor factura",
		"step_12_invoice_submission",
		a.invId,
		"Emisión factura",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
}

function addFieldsForStep14(fields: InheritedField[], a: ArtifactRefs): void {
	addField(
		fields,
		a.inv?.id,
		"approvedInvoiceId",
		"Factura aprobada",
		"step_13_invoice_approval",
		a.invId,
		"Aprobación factura",
		false,
		true,
	);
	addField(
		fields,
		a.inv?.status,
		"invoiceAmount",
		"Valor factura",
		"step_13_invoice_approval",
		a.invId,
		"Aprobación factura",
		true,
		false,
	);
	addField(
		fields,
		a.inv?.updatedAt,
		"paymentDueDate",
		"Fecha de vencimiento",
		"step_12_invoice_submission",
		a.invId,
		"Emisión factura",
		true,
		false,
	);
	addField(
		fields,
		a.pay?.status,
		"paymentStatus",
		"Estado de pago",
		"step_14_payment_closure",
		a.payId,
		"Pago y cierre",
		true,
		false,
	);
	addField(
		fields,
		a.serviceCase.clientName,
		"clientName",
		"Nombre del cliente",
		"step_01_work_request",
		a.wrId,
		"Solicitud de servicio",
		false,
		true,
	);
}

// Dispatcher map: step code → resolver fn
const STEP_FIELD_RESOLVERS: Partial<
	Record<CermontOperationalStepCode, (fields: InheritedField[], a: ArtifactRefs) => void>
> = {
	step_02_site_visit: addFieldsForStep02,
	step_03_proposal: addFieldsForStep03,
	step_04_purchase_order: addFieldsForStep04,
	step_05_planning: addFieldsForStep05,
	step_06_execution: addFieldsForStep06,
	step_07_technical_report: addFieldsForStep07,
	step_08_delivery_record: addFieldsForStep08,
	step_09_client_signature: addFieldsForStep09,
	step_10_ses_submission: addFieldsForStep10,
	step_11_ses_approval: addFieldsForStep11,
	step_12_invoice_submission: addFieldsForStep12,
	step_13_invoice_approval: addFieldsForStep13,
	step_14_payment_closure: addFieldsForStep14,
};

/**
 * Builds inherited fields for the target step by gathering data from
 * all completed previous step entities.
 */
function resolveInheritedFields(
	_serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
	serviceCase: ServiceCaseLeanObj,
): InheritedField[] {
	const fields: InheritedField[] = [];
	const artifacts = serviceCase.artifacts ?? {};
	const extract = (
		key: string,
	):
		| { id?: { toString(): string }; code?: string; status?: string; updatedAt?: string | Date }
		| Undef => artifacts[key];

	const getId = (obj: { id?: { toString(): string } } | Undef): string =>
		obj?.id ? String(obj.id) : "";

	const wr = extract("workRequest");
	const sv = extract("siteVisit");
	const pr = extract("proposal");
	const po = extract("purchaseOrder");
	const pp = extract("planningPacket");
	const es = extract("executionSession");
	const tr = extract("technicalReport");
	const dr = extract("deliveryRecord");
	const ses = extract("serviceEntrySheet");
	const inv = extract("invoice");
	const pay = extract("payment");

	const refs: ArtifactRefs = {
		serviceCase,
		wrId: getId(wr),
		svId: getId(sv),
		prId: getId(pr),
		poId: getId(po),
		ppId: getId(pp),
		esId: getId(es),
		trId: getId(tr),
		drId: getId(dr),
		sesId: getId(ses),
		invId: getId(inv),
		payId: getId(pay),
		sv,
		pr,
		po,
		pp,
		es,
		tr,
		dr,
		ses,
		inv,
		pay,
	};

	const resolver = STEP_FIELD_RESOLVERS[stepCode];
	if (resolver) {
		resolver(fields, refs);
	}

	return fields;
}

/**
 * Resolves the previous step entity reference.
 */
function resolvePreviousStepEntity(
	stepCode: CermontOperationalStepCode,
	serviceCase: ServiceCaseLeanObj,
): ServiceCaseStepContext["previousStep"] {
	const prevStepCode = PREVIOUS_STEP[stepCode];
	if (!prevStepCode) {
		return void 0;
	}

	const stepDef = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === prevStepCode);
	if (!stepDef) {
		return void 0;
	}

	const artifactKey = stepDef.entityType;
	const artifacts = serviceCase.artifacts ?? {};
	const artifact = artifacts[artifactKey];

	if (!artifact?.id) {
		return void 0;
	}

	return {
		stepCode: prevStepCode,
		entityId: String(artifact.id),
		entityType: artifactKey,
		status: String(artifact.status ?? ""),
	};
}

/**
 * Resolves required fields for the current step based on the step definition.
 */
function resolveStepRequiredFields(stepCode: CermontOperationalStepCode): StepRequiredField[] {
	const stepDef = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === stepCode);
	if (!stepDef) {
		return [];
	}

	const fields: StepRequiredField[] = [];

	for (const doc of stepDef.requiredDocuments) {
		fields.push({
			key: `document:${doc}`,
			label: `Documento: ${doc.replace(/_/g, " ")}`,
			type: "document",
			required: true,
			blocksTransition: stepDef.blocksTransition,
		});
	}

	for (const ev of stepDef.requiredEvidences) {
		fields.push({
			key: `evidence:${ev}`,
			label: `Evidencia: ${ev.replace(/_/g, " ")}`,
			type: "evidence",
			required: true,
			blocksTransition: stepDef.blocksTransition,
		});
	}

	for (const sig of stepDef.requiredSignatures) {
		fields.push({
			key: `signature:${sig}`,
			label: `Firma: ${sig.replace(/_/g, " ")}`,
			type: "signature",
			required: true,
			blocksTransition: stepDef.blocksTransition,
		});
	}

	for (const form of stepDef.requiredForms) {
		fields.push({
			key: `form:${form}`,
			label: `Formulario: ${form.replace(/_/g, " ")}`,
			type: "form",
			required: true,
			blocksTransition: stepDef.blocksTransition,
		});
	}

	return fields;
}

/**
 * Resolves linked entity IDs from ServiceCase artifacts.
 */

function resolveLinkedEntityIds(
	serviceCase: ServiceCaseLeanObj,
): ServiceCaseStepContext["linkedEntityIds"] {
	const artifacts = serviceCase.artifacts ?? {};
	const extract = (key: string): string | Undef => {
		const entry = artifacts[key];
		return entry?.id ? String(entry.id) : void 0;
	};

	return {
		workRequestId: extract("workRequest"),
		siteVisitId: extract("siteVisit"),
		proposalId: extract("proposal"),
		purchaseOrderId: extract("purchaseOrder"),
		workOrderId: extract("workOrder"),
		planningPacketId: extract("planningPacket"),
		executionSessionId: extract("executionSession"),
		technicalReportId: extract("technicalReport"),
		deliveryRecordId: extract("deliveryRecord"),
		serviceEntrySheetId: extract("serviceEntrySheet"),
		invoiceId: extract("invoice"),
		paymentId: extract("payment"),
	};
}

/**
 * Resolves allowed actions for the current step based on step definition and blockers.
 */
function resolveAllowedActions(
	stepCode: CermontOperationalStepCode,
	blockers: DomainBlocker[],
): StepAllowedAction[] {
	const stepDef = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === stepCode);
	if (!stepDef) {
		return [];
	}

	const hasCriticalBlockers = blockers.some((b) => b.severity === "blocking");
	if (hasCriticalBlockers) {
		// Return blocker-resolving actions
		return blockers.slice(0, 3).map((blocker) => ({
			command: `resolve:${blocker.code.toLowerCase()}`,
			label: blocker.recommendedAction,
			requiredRole: blocker.ownerRole,
			route: stepDef.route,
		}));
	}

	return [
		{
			command: `enter:${stepCode}`,
			label: stepDef.nextAction,
			requiredRole: stepDef.allowedRoles[0] || "residente",
			route: stepDef.route,
		},
	];
}

// ──────────────────────────────────────────────────────────────────────────────
// Main context builder
// ──────────────────────────────────────────────────────────────────────────────

export async function buildServiceCaseStepContext(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
): Promise<ServiceCaseStepContext> {
	// Validate stepCode is valid
	const queryResult = StepContextQuerySchema.safeParse({ stepCode });
	if (!queryResult.success) {
		throw new NotFoundError("Invalid stepCode", stepCode);
	}

	// Load service case
	const rawCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!rawCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const caseObj = rawCase as ServiceCaseLeanObj;

	// Resolve blockers using the existing gate service
	const blockers = await calculateStepBlockers(serviceCaseId);

	// Build context
	const context: ServiceCaseStepContext = {
		serviceCaseId,
		currentStepCode: stepCode,
		currentStepLabel: STEP_LABELS[stepCode] ?? stepCode,
		canonical: resolveCanonicalCaseData(caseObj),
		inheritedFields: resolveInheritedFields(serviceCaseId, stepCode, caseObj),
		previousStep: resolvePreviousStepEntity(stepCode, caseObj),
		overrides: [],
		blockers,
		allowedActions: resolveAllowedActions(stepCode, blockers),
		requiredFields: resolveStepRequiredFields(stepCode),
		linkedEntityIds: resolveLinkedEntityIds(caseObj),
		generatedAt: new Date().toISOString(),
	};

	return context;
}
