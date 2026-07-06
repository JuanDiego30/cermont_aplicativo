import type {
	ActaSignature,
	ClosureReport,
	ClosureRequirement,
	InvoiceTracking,
	SESTracking,
} from "@cermont/shared-types";
import { evaluateClosureReadiness } from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	NotFoundError,
	ServiceUnavailableError,
	UnprocessableError,
} from "../../common/errors/AppError";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { Document, Order } from "../../models";
import { DeliveryRecord, type DeliveryRecordDocument } from "../../models/DeliveryRecord";
import { Invoice, type InvoiceDocument } from "../../models/Invoice";
import { Payment, type PaymentDocument } from "../../models/Payment";
import { ServiceEntrySheet, type ServiceEntrySheetDocument } from "../../models/ServiceEntrySheet";

const CLOSURE_REQUIREMENT_DEFINITIONS: Array<{
	kind: ClosureRequirement["kind"];
	label: string;
	stepCode: ClosureRequirement["stepCode"];
}> = [
	{ kind: "acta_delivery", label: "Acta de entrega", stepCode: "step_09_delivery_record" },
	{ kind: "client_signature", label: "Firma del cliente", stepCode: "step_10_client_signature" },
	{ kind: "ses_filing", label: "Radicación SES", stepCode: "step_11_ses" },
	{ kind: "ses_approval", label: "Aprobación SES", stepCode: "step_11_ses" },
	{
		kind: "invoice_sent",
		label: "Factura emitida / enviada",
		stepCode: "step_12_invoice",
	},
	{ kind: "invoice_approval", label: "Factura aprobada", stepCode: "step_13_invoice_approval" },
	{
		kind: "payment_support",
		label: "Soporte de pago y conciliación",
		stepCode: "step_14_payment",
	},
];

function normalizeSignatureType(value: string | undefined): ActaSignature["signatureType"] {
	if (value === "manual_upload" || value === "digital_text" || value === "pending") {
		return value;
	}
	return "pending";
}

function normalizeSesStatus(value: string | undefined): SESTracking["sesStatus"] {
	if (
		value === "pending" ||
		value === "submitted" ||
		value === "approved" ||
		value === "rejected"
	) {
		return value;
	}
	return "pending";
}

function normalizeInvoiceStatus(value: string | undefined): InvoiceTracking["invoiceStatus"] {
	if (value === "pending" || value === "issued" || value === "approved" || value === "rejected") {
		return value;
	}
	return "pending";
}

function findClosingDocument(
	closingDocs: Array<{
		_id: { toString(): string };
		file_url: string;
		targetStepCode?: string;
	}>,
	stepCode: ClosureRequirement["stepCode"],
) {
	return closingDocs.find((document) => document.targetStepCode === stepCode);
}

type ClosureEvaluator = (params: {
	deliveryRecord: DeliveryRecordDocument | null;
	invoice: InvoiceDocument | null;
	payment: PaymentDocument | null;
	ses: ServiceEntrySheetDocument | null;
	document: { _id: { toString(): string }; file_url: string } | undefined;
}) => { completed: boolean; message?: string };

const CLOSURE_EVALUATORS: Record<ClosureRequirement["kind"], ClosureEvaluator> = {
	acta_delivery: ({ deliveryRecord, document }) => ({
		completed: !!deliveryRecord || !!document,
		message:
			!deliveryRecord && !document ? "Falta generar o cargar el acta de entrega." : undefined,
	}),
	client_signature: ({ deliveryRecord, document }) => ({
		completed: deliveryRecord?.status === "signed" || !!deliveryRecord?.signedAt || !!document,
		message:
			deliveryRecord?.status !== "signed" && !deliveryRecord?.signedAt && !document
				? "Falta firma o aceptación del cliente."
				: undefined,
	}),
	ses_filing: ({ ses, document }) => ({
		completed: ses?.status === "submitted" || ses?.status === "approved" || !!document,
		message:
			ses?.status !== "submitted" && ses?.status !== "approved" && !document
				? "La SES aún no ha sido radicada."
				: undefined,
	}),
	ses_approval: ({ ses, document }) => ({
		completed: ses?.status === "approved" || !!document,
		message:
			ses?.status !== "approved" && !document ? "La SES aún no ha sido aprobada." : undefined,
	}),
	invoice_sent: ({ invoice, document }) => ({
		completed:
			["sent", "submitted", "approved", "accepted", "paid"].includes(invoice?.status || "") ||
			!!document,
		message:
			!["sent", "submitted", "approved", "accepted", "paid"].includes(invoice?.status || "") &&
			!document
				? "La factura aún no ha sido emitida o enviada."
				: undefined,
	}),
	invoice_approval: ({ invoice, document }) => ({
		completed: ["approved", "accepted", "paid"].includes(invoice?.status || "") || !!document,
		message:
			!["approved", "accepted", "paid"].includes(invoice?.status || "") && !document
				? "La factura aún no ha sido aprobada."
				: undefined,
	}),
	payment_support: ({ payment, document }) => ({
		completed: payment?.status === "reconciled" || !!document,
		message:
			payment?.status !== "reconciled" && !document
				? "Falta soporte de pago o conciliación bancaria definitiva."
				: undefined,
	}),
	other_support: () => ({ completed: false }),
};

function buildClosureRequirements(params: {
	closingDocs: Array<{
		_id: { toString(): string };
		file_url: string;
		targetStepCode?: string;
	}>;
	deliveryRecord: DeliveryRecordDocument | null;
	invoice: InvoiceDocument | null;
	payment: PaymentDocument | null;
	ses: ServiceEntrySheetDocument | null;
}): ClosureRequirement[] {
	return CLOSURE_REQUIREMENT_DEFINITIONS.map((definition) => {
		const document = findClosingDocument(params.closingDocs, definition.stepCode);
		const evaluator = CLOSURE_EVALUATORS[definition.kind];
		const { completed, message } = evaluator({ ...params, document });

		return {
			kind: definition.kind,
			stepCode: definition.stepCode,
			label: definition.label,
			status: completed ? "completed" : document ? "pending" : "missing",
			message,
			documentId: document?._id.toString(),
			documentUrl: document?.file_url,
		};
	});
}

/**
 * Valida un reporte de cierre ya calculado (función pura, testeable sin base de datos).
 */
export function validateAdministrativeClosureReport(
	report: Pick<ClosureReport, "canCloseAdministratively" | "missingClosureKinds">,
): void {
	if (!report.canCloseAdministratively) {
		const missing = report.missingClosureKinds?.length
			? report.missingClosureKinds.join(", ")
			: "acta, firma, SES, factura o pago";
		throw new UnprocessableError(
			`No se puede cerrar la orden: faltan requisitos administrativos (${missing}).`,
			"ADMINISTRATIVE_CLOSURE_INCOMPLETE",
		);
	}
}

/**
 * Valida que los requisitos administrativos (pasos 8–14) estén completos antes del cierre definitivo.
 */
export async function assertAdministrativeClosureReady(orderId: string): Promise<void> {
	const report = await getConsolidatedReport(orderId);
	validateAdministrativeClosureReport(report);
}

/**
 * Genera un reporte consolidado de cierre administrativo agregando datos de múltiples entidades.
 * Implementa el patrón "Read Model" para trazabilidad de los pasos 8-14.
 */
/**
 * Carga en paralelo todas las entidades relacionadas al cierre administrativo.
 * Extraída de getConsolidatedReport para reducir complejidad cognitiva.
 */
async function loadClosureEntities(
	orderObjectId: Types.ObjectId,
	linkedEntityIds: Types.ObjectId[],
): Promise<{
	deliveryRecord: DeliveryRecordDocument | null;
	ses: ServiceEntrySheetDocument | null;
	invoice: InvoiceDocument | null;
	payment: PaymentDocument | null;
	closingDocs: InstanceType<typeof Document>[];
}> {
	try {
		const [deliveryRecord, ses, invoice, payment, closingDocs] = await Promise.all([
			DeliveryRecord.findOne({ workOrderId: orderObjectId, status: { $ne: "cancelled" } }),
			ServiceEntrySheet.findOne({ workOrderId: orderObjectId, status: { $ne: "cancelled" } }),
			Invoice.findOne({ workOrderId: orderObjectId, status: { $ne: "cancelled" } }),
			Payment.findOne({ workOrderId: orderObjectId, status: { $ne: "cancelled" } }),
			Document.find({
				linkedEntityId: { $in: linkedEntityIds },
				targetStepCode: {
					$in: [
						"step_09_delivery_record",
						"step_10_client_signature",
						"step_11_ses",
						"step_11_ses",
						"step_12_invoice",
						"step_13_invoice_approval",
						"step_14_payment",
					],
				},
			}),
		]);
		return { deliveryRecord, ses, invoice, payment, closingDocs };
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}
}

export async function getConsolidatedReport(
	orderId: string,
	serviceCaseId?: string,
): Promise<ClosureReport> {
	const orderObjectId = new Types.ObjectId(orderId);
	const linkedEntityIds = [orderObjectId];
	if (serviceCaseId && Types.ObjectId.isValid(serviceCaseId)) {
		linkedEntityIds.push(new Types.ObjectId(serviceCaseId));
	}

	// 1. Verificar existencia de la orden
	const order = await Order.findById(orderObjectId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// 2. Cargar artefactos relacionados en paralelo
	const { deliveryRecord, ses, invoice, payment, closingDocs } = await loadClosureEntities(
		orderObjectId,
		linkedEntityIds,
	);

	const requirements = buildClosureRequirements({
		deliveryRecord,
		ses,
		invoice,
		payment,
		closingDocs,
	});
	const closureReadiness = evaluateClosureReadiness(requirements);

	// 3. Mapear al ClosureReportSchema (Zod) definido en shared-types
	return {
		_id: order._id.toString(), // Usamos el ID de la orden como ancla del reporte
		orderId: order._id.toString(),
		technicalObservations: order.observations,
		materialsUsed: [],
		actualHours: 0,
		completionNotes: `Se encontraron ${closingDocs.length} documentos de soporte administrativo vinculados.`,

		// Paso 9: Firma del acta
		acta: deliveryRecord
			? {
					signedBy: deliveryRecord.signedBy || "",
					signedAt: deliveryRecord.signedAt?.toISOString() || new Date().toISOString(),
					signatureType: normalizeSignatureType(deliveryRecord.signatureMethod),
					signatureDocumentUrl:
						deliveryRecord.signedDocumentRef ||
						closingDocs.find((d) => d.targetStepCode === "step_10_client_signature")?.file_url,
				}
			: undefined,

		// Pasos 10-11: SES
		ses: ses
			? {
					sesNumber: ses.aribaDocumentNumber,
					sesRadicatedAt: ses.submittedAt?.toISOString(),
					sesRadicatedBy: ses.submittedBy?.toString(),
					sesApprovedAt: ses.approvedAt?.toISOString(),
					sesApprovedBy: ses.approvedBy?.toString(),
					sesStatus: normalizeSesStatus(ses.status),
					sesNotes: ses.description,
					supportDocumentUrl: closingDocs.find((d) => d.targetStepCode === "step_11_ses")?.file_url,
				}
			: undefined,

		// Pasos 12-13: Facturación
		invoice: invoice
			? {
					invoiceNumber: invoice.invoiceNumber || invoice.code,
					invoiceAmount: invoice.totalAmount,
					invoiceCurrency: invoice.currency,
					invoiceIssuedAt: invoice.issuedAt?.toISOString(),
					invoiceStatus: normalizeInvoiceStatus(invoice.status),
					invoiceApprovedAt: invoice.approvedAt?.toISOString(),
					invoiceApprovedBy: invoice.acceptedBy?.toString(),
					invoiceDocumentUrl:
						invoice.attachments?.[0]?.url ||
						closingDocs.find((d) => d.targetStepCode === "step_12_invoice")?.file_url,
				}
			: undefined,

		// Paso 14: Pago
		payment: payment
			? {
					paymentDate: payment.paidAt.toISOString(),
					paymentAmount: payment.amount,
					paymentReference: payment.paymentReference,
					paymentConfirmedBy: payment.recordedBy.toString(),
					paymentSupportUrl:
						payment.supportingDocumentUrl ||
						closingDocs.find((d) => d.targetStepCode === "step_14_payment")?.file_url,
				}
			: undefined,
		requirements,
		completionPercentage: closureReadiness.completionPercentage,
		canCloseAdministratively: closureReadiness.canCloseAdministratively,
		missingClosureKinds: closureReadiness.missingKinds,

		createdAt: order.createdAt.toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: order.createdBy?.toString(),
	};
}
