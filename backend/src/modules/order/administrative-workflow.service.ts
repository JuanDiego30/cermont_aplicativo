import type {
	ApproveServiceEntrySheetInput,
	ApproveTechnicalReportInput,
	CreateDeliveryRecordV2Input,
	CreateOrderInvoiceInput,
	CreateOrderServiceEntrySheetInput,
	CreateTechnicalReportInput,
	DeliveryRecord as DeliveryRecordResponse,
	GenerateTechnicalReportInput,
	Invoice as InvoiceResponse,
	ListDeliveryRecordsQuery,
	ListInvoicesQuery,
	ListPaymentsQuery,
	ListServiceEntrySheetsQuery,
	ListTechnicalReportsQuery,
	Payment as PaymentResponse,
	ReconcilePaymentInput,
	RegisterInvoicePaymentInput,
	RejectDeliveryRecordInput,
	RejectPaymentRecordInput,
	RejectServiceEntrySheetInput,
	RejectTechnicalReportInput,
	SendDeliveryRecordInput,
	ServiceCaseStage,
	ServiceEntrySheet as ServiceEntrySheetResponse,
	SignDeliveryRecordInput,
	SubmitServiceEntrySheetInput,
	TechnicalReport as TechnicalReportResponse,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	BadRequestError,
	NotFoundError,
	ServiceUnavailableError,
	UnprocessableError,
} from "../../common/errors/AppError";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import {
	DeliveryRecord,
	type DeliveryRecordDocument,
	ExecutionSession,
	Invoice,
	type InvoiceDocument,
	Order,
	Payment,
	type PaymentDocument,
	PlanningPacket,
	ServiceCase,
	ServiceEntrySheet,
	type ServiceEntrySheetDocument,
	TechnicalReport,
	type TechnicalReportDocument,
} from "../../models";
import { assertInvoiceMatchesServiceEntrySheet } from "../../services/invoice-integrity.service";

type ListEnvelope<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};

type WorkflowActor = {
	_id: string;
	role: string;
};

type ArtifactKey =
	| "technicalReport"
	| "deliveryRecord"
	| "serviceEntrySheet"
	| "invoice"
	| "payment";

type ArtifactProjection = {
	id: string;
	code: string;
	status: string;
	updatedAt: string;
};

type NextActionProjection = {
	command: string;
	label: string;
	requiredRole: string;
	route?: string;
};

type ServiceCaseSetValue =
	| string
	| Date
	| ArtifactProjection
	| NextActionProjection[]
	| Record<string, number | string>;

const DEFAULT_LIMIT = 20;
const PAYMENT_ELIGIBLE_INVOICE_STATUSES = new Set<InvoiceDocument["status"]>([
	"approved",
	"accepted",
	"partially_paid",
]);

function parseObjectId(value: string, field: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${field}`, `INVALID_${field.toUpperCase()}`);
	}
	return new Types.ObjectId(value);
}

function maybeObjectId(value: string | undefined): Types.ObjectId | undefined {
	if (!value) {
		return undefined;
	}
	return parseObjectId(value, "id");
}

function iso(value: Date | undefined): string | undefined {
	return value?.toISOString();
}

function pages(total: number, limit: number): number {
	return Math.max(Math.ceil(total / Math.max(limit, 1)), 1);
}

async function nextCode(prefix: string, countDocuments: () => Promise<number>): Promise<string> {
	const count = await countDocuments();
	return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
}

function commandEntry(clientMutationId: string | undefined, command: string) {
	return clientMutationId ? [{ clientMutationId, command, recordedAt: new Date() }] : [];
}

function validateInvoiceAgainstSes(invoice: InvoiceDocument, ses: ServiceEntrySheetDocument): void {
	assertInvoiceMatchesServiceEntrySheet(
		{
			serviceEntrySheetId: invoice.serviceEntrySheetId?.toString() ?? "",
			workOrderId: invoice.workOrderId.toString(),
			currency: invoice.currency,
			amount: invoice.amount,
			taxAmount: invoice.taxAmount,
			totalAmount: invoice.totalAmount,
			invoiceLines: invoice.invoiceLines,
		},
		{
			id: ses._id.toString(),
			status: ses.status,
			workOrderId: ses.workOrderId?.toString() ?? "",
			currency: ses.currency,
			amount: ses.amount,
			taxAmount: ses.taxAmount,
			totalAmount: ses.totalAmount,
			serviceLines: ses.serviceLines,
		},
	);
}

async function assertPersistedInvoiceMatchesSes(invoice: InvoiceDocument): Promise<void> {
	if (!invoice.serviceEntrySheetId) {
		throw new UnprocessableError("Invoice must reference an approved SES", "INVOICE_SES_MISMATCH");
	}
	const ses = await requireServiceEntrySheet(invoice.serviceEntrySheetId.toString());
	validateInvoiceAgainstSes(invoice, ses);
}

async function updateServiceCaseArtifact(
	serviceCaseId: Types.ObjectId | undefined,
	artifactKey: ArtifactKey,
	artifact: ArtifactProjection,
	stage: ServiceCaseStage,
	nextActions: NextActionProjection[],
	financialSummary?: Record<string, number | string>,
): Promise<void> {
	if (!serviceCaseId) {
		return;
	}

	const set: Record<string, ServiceCaseSetValue> = {
		[`artifacts.${artifactKey}`]: artifact,
		currentStage: stage,
		nextActions,
		updatedAt: new Date(),
	};

	if (financialSummary) {
		set.financialSummary = financialSummary;
	}

	await ServiceCase.findByIdAndUpdate(serviceCaseId, { $set: set });
}

function toArtifactProjection(doc: {
	_id: Types.ObjectId;
	code: string;
	status: string;
	updatedAt: Date;
}): ArtifactProjection {
	return {
		id: doc._id.toString(),
		code: doc.code,
		status: doc.status,
		updatedAt: doc.updatedAt.toISOString(),
	};
}

function formatTechnicalReport(doc: TechnicalReportDocument): TechnicalReportResponse {
	return {
		_id: doc._id.toString(),
		workOrderId: doc.workOrderId.toString(),
		executionSessionId: doc.executionSessionId.toString(),
		code: doc.code,
		executionSummary: doc.executionSummary,
		activitiesPerformed: doc.activitiesPerformed,
		findings: doc.findings,
		deviations: doc.deviations,
		materialsUsedSnapshot: [],
		laborSnapshot: [],
		equipmentUsageSnapshot: [],
		incidentSnapshot: [],
		evidenceRefs: [],
		signatureSnapshot: {},
		generatedPdfUrl: doc.generatedPdfUrl,
		generatedBy: doc.generatedBy.toString(),
		generatedAt: doc.generatedAt.toISOString(),
		reviewedBy: doc.reviewedBy?.toString(),
		reviewedAt: iso(doc.reviewedAt),
		approvedBy: doc.approvedBy?.toString(),
		approvedAt: iso(doc.approvedAt),
		rejectedBy: doc.rejectedBy?.toString(),
		rejectedAt: iso(doc.rejectedAt),
		rejectionReason: doc.rejectionReason,
		status: doc.status as TechnicalReportResponse["status"],
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

function formatDeliveryRecord(doc: DeliveryRecordDocument): DeliveryRecordResponse {
	return {
		_id: doc._id.toString(),
		workOrderId: doc.workOrderId.toString(),
		technicalReportId: doc.technicalReportId.toString(),
		code: doc.code,
		deliveryDate: iso(doc.deliveryDate),
		clientRepresentative: doc.clientRepresentative,
		clientContact: doc.clientContact,
		acceptanceStatus: doc.acceptanceStatus as DeliveryRecordResponse["acceptanceStatus"],
		clientObservations: doc.clientObservations,
		signedDocumentRef: doc.signedDocumentRef,
		signatureMethod: doc.signatureMethod as DeliveryRecordResponse["signatureMethod"],
		signedAt: iso(doc.signedAt),
		signedBy: doc.signedBy,
		sentAt: iso(doc.sentAt),
		sentBy: doc.sentBy?.toString(),
		rejectedAt: iso(doc.rejectedAt),
		rejectedBy: doc.rejectedBy?.toString(),
		rejectionReason: doc.rejectionReason,
		status: doc.status as DeliveryRecordResponse["status"],
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

function formatServiceEntrySheet(doc: ServiceEntrySheetDocument): ServiceEntrySheetResponse {
	return {
		_id: doc._id.toString(),
		code: doc.code,
		workOrderId: doc.workOrderId?.toString() ?? "",
		workOrderCode: doc.workOrderCode,
		deliveryRecordId: doc.deliveryRecordId?.toString(),
		technicalReportId: doc.technicalReportId?.toString(),
		clientId: doc.clientId.toString(),
		clientName: doc.clientName,
		billingAccount: doc.billingAccount,
		aribaReference: doc.aribaReference,
		aribaDocumentNumber: doc.aribaDocumentNumber,
		submittedAt: iso(doc.submittedAt),
		submittedBy: doc.submittedBy?.toString(),
		approvedAt: iso(doc.approvedAt),
		approvedBy: doc.approvedBy?.toString(),
		approverReference: doc.approverReference,
		rejectedAt: iso(doc.rejectedAt),
		rejectedBy: doc.rejectedBy?.toString(),
		rejectionReason: doc.rejectionReason,
		amount: doc.amount,
		currency: doc.currency as ServiceEntrySheetResponse["currency"],
		taxAmount: doc.taxAmount,
		totalAmount: doc.totalAmount,
		serviceLines: doc.serviceLines,
		subtotal: doc.subtotal,
		taxLines: doc.taxLines,
		total: doc.total,
		description: doc.description,
		status: doc.status as ServiceEntrySheetResponse["status"],
		attachments: doc.attachments.map((attachment) => ({
			id: attachment.id?.toString(),
			url: attachment.url,
			type: attachment.type as "pdf" | "image" | "document",
			name: attachment.name,
			uploadedAt: iso(attachment.uploadedAt),
		})),
		commandHistory: doc.commandHistory.map((entry) => ({
			clientMutationId: entry.clientMutationId,
			command: entry.command,
			recordedAt: entry.recordedAt.toISOString(),
		})),
		createdBy: doc.createdBy.toString(),
		updatedBy: doc.updatedBy?.toString(),
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

function formatInvoice(doc: InvoiceDocument): InvoiceResponse {
	return {
		_id: doc._id.toString(),
		code: doc.code,
		workOrderId: doc.workOrderId.toString(),
		workOrderCode: doc.workOrderCode,
		serviceEntrySheetId: doc.serviceEntrySheetId?.toString(),
		serviceEntrySheetCode: doc.serviceEntrySheetCode,
		clientId: doc.clientId.toString(),
		clientName: doc.clientName,
		billingAccount: doc.billingAccount,
		invoiceNumber: doc.invoiceNumber,
		amount: doc.amount,
		taxAmount: doc.taxAmount,
		totalAmount: doc.totalAmount,
		currency: doc.currency as InvoiceResponse["currency"],
		issuedAt: iso(doc.issuedAt),
		sentAt: iso(doc.sentAt),
		submittedAt: iso(doc.submittedAt),
		submittedBy: doc.submittedBy?.toString(),
		approvedAt: iso(doc.approvedAt),
		approvedBy: doc.approvedBy?.toString(),
		acceptedAt: iso(doc.acceptedAt),
		acceptedBy: doc.acceptedBy?.toString(),
		rejectedAt: iso(doc.rejectedAt),
		rejectedBy: doc.rejectedBy?.toString(),
		rejectionReason: doc.rejectionReason,
		paidAt: iso(doc.paidAt),
		paymentReference: doc.paymentReference,
		issueDate: iso(doc.issueDate),
		dueDate: iso(doc.dueDate),
		invoiceLines: doc.invoiceLines,
		taxBreakdown: doc.taxBreakdown,
		subtotal: doc.subtotal,
		total: doc.total,
		status: doc.status as InvoiceResponse["status"],
		attachments: doc.attachments.map((attachment) => ({
			id: attachment.id?.toString(),
			url: attachment.url,
			type: attachment.type as "pdf" | "image" | "document",
			name: attachment.name,
			uploadedAt: iso(attachment.uploadedAt),
		})),
		commandHistory: doc.commandHistory.map((entry) => ({
			clientMutationId: entry.clientMutationId,
			command: entry.command,
			recordedAt: entry.recordedAt.toISOString(),
		})),
		notes: doc.notes,
		createdBy: doc.createdBy.toString(),
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
		seller: doc.seller,
		buyer: doc.buyer,
		lineItems: doc.lineItems,
		taxBase: doc.taxBase,
		ivaRate: doc.ivaRate,
		ivaAmount: doc.ivaAmount,
		retentionRate: doc.retentionRate,
		retentionAmount: doc.retentionAmount,
		cufe: doc.cufe,
		qrCode: doc.qrCode,
		dianStatus: doc.dianStatus,
		dianTrackId: doc.dianTrackId,
		dianDocumentHash: doc.dianDocumentHash,
		dianErrorCode: doc.dianErrorCode,
		paymentMethod: doc.paymentMethod as InvoiceResponse["paymentMethod"],
		numeroResolucion: doc.numeroResolucion,
		totalConIva: doc.totalConIva,
		retencionFuente: doc.retencionFuente,
		nitEmisor: doc.nitEmisor,
		nitReceptor: doc.nitReceptor,
		tipoDocumento: (doc.tipoDocumento || "FV") as InvoiceResponse["tipoDocumento"],
	};
}

function formatPayment(doc: PaymentDocument): PaymentResponse {
	return {
		_id: doc._id.toString(),
		invoiceId: doc.invoiceId.toString(),
		workOrderId: doc.workOrderId.toString(),
		serviceEntrySheetId: doc.serviceEntrySheetId.toString(),
		clientId: doc.clientId.toString(),
		paymentReference: doc.paymentReference,
		paidAt: doc.paidAt.toISOString(),
		amount: doc.amount,
		currency: doc.currency as PaymentResponse["currency"],
		paymentMethod: doc.paymentMethod as PaymentResponse["paymentMethod"],
		bankReference: doc.bankReference,
		supportingDocument: doc.supportingDocument,
		supportingDocumentUrl: doc.supportingDocumentUrl,
		recordedBy: doc.recordedBy.toString(),
		recordedAt: doc.recordedAt.toISOString(),
		reconciledBy: doc.reconciledBy?.toString(),
		reconciledAt: iso(doc.reconciledAt),
		rejectedBy: doc.rejectedBy?.toString(),
		rejectedAt: iso(doc.rejectedAt),
		rejectionReason: doc.rejectionReason,
		commandHistory: doc.commandHistory.map((entry) => ({
			clientMutationId: entry.clientMutationId,
			command: entry.command,
			recordedAt: entry.recordedAt.toISOString(),
		})),
		status: doc.status as PaymentResponse["status"],
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

async function getRecordedPaymentTotal(invoiceId: Types.ObjectId): Promise<number> {
	const [summary] = await Payment.aggregate<{ paidTotal: number }>([
		{
			$match: {
				invoiceId,
				status: { $ne: "rejected" },
			},
		},
		{
			$group: {
				_id: "$invoiceId",
				paidTotal: { $sum: "$amount" },
			},
		},
	]);

	return summary?.paidTotal ?? 0;
}

async function requireTechnicalReport(id: string): Promise<TechnicalReportDocument> {
	const report = await TechnicalReport.findById(parseObjectId(id, "technicalReportId"));
	if (!report) {
		throw new NotFoundError("TechnicalReport", id);
	}
	return report;
}

async function requireDeliveryRecord(id: string): Promise<DeliveryRecordDocument> {
	const record = await DeliveryRecord.findById(parseObjectId(id, "deliveryRecordId"));
	if (!record) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	return record;
}

async function requireServiceEntrySheet(id: string): Promise<ServiceEntrySheetDocument> {
	const ses = await ServiceEntrySheet.findById(parseObjectId(id, "serviceEntrySheetId"));
	if (!ses) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	return ses;
}

async function requireInvoice(id: string): Promise<InvoiceDocument> {
	const invoice = await Invoice.findById(parseObjectId(id, "invoiceId"));
	if (!invoice) {
		throw new NotFoundError("Invoice", id);
	}
	return invoice;
}

async function requirePayment(id: string): Promise<PaymentDocument> {
	const payment = await Payment.findById(parseObjectId(id, "paymentId"));
	if (!payment) {
		throw new NotFoundError("Payment", id);
	}
	return payment;
}

function buildReportSummary(sessionId: string, input: CreateTechnicalReportInput): string {
	return (
		input.executionSummary?.trim() ||
		`Informe técnico generado desde la sesión de ejecución ${sessionId}.`
	);
}

export async function listTechnicalReports(
	filters: ListTechnicalReportsQuery,
): Promise<ListEnvelope<TechnicalReportResponse>> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? DEFAULT_LIMIT;
	const query: Record<string, Types.ObjectId | string> = {};
	const workOrderId = maybeObjectId(filters.workOrderId);
	const executionSessionId = maybeObjectId(filters.executionSessionId);
	if (workOrderId) {
		query.workOrderId = workOrderId;
	}
	if (executionSessionId) {
		query.executionSessionId = executionSessionId;
	}
	if (filters.status) {
		query.status = filters.status;
	}
	const [docs, total] = await Promise.all([
		TechnicalReport.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		TechnicalReport.countDocuments(query),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});
	return { data: docs.map(formatTechnicalReport), total, page, limit, pages: pages(total, limit) };
}

export async function getTechnicalReportById(id: string): Promise<TechnicalReportResponse> {
	return formatTechnicalReport(await requireTechnicalReport(id));
}

export async function getTechnicalReportByOrder(
	workOrderId: string,
): Promise<
	TechnicalReportResponse | { workOrderId: string; status: "not_created"; message: string }
> {
	const report = await TechnicalReport.findOne({
		workOrderId: parseObjectId(workOrderId, "workOrderId"),
		status: { $ne: "cancelled" },
	});
	return report
		? formatTechnicalReport(report)
		: { workOrderId, status: "not_created", message: "No hay informe técnico generado." };
}

export async function getTechnicalReportByExecutionSession(
	executionSessionId: string,
): Promise<
	TechnicalReportResponse | { workOrderId: string; status: "not_created"; message: string }
> {
	const sessionObjectId = parseObjectId(executionSessionId, "executionSessionId");
	const report = await TechnicalReport.findOne({
		executionSessionId: sessionObjectId,
		status: { $ne: "cancelled" },
	});
	if (report) {
		return formatTechnicalReport(report);
	}
	const session = await ExecutionSession.findById(sessionObjectId);
	if (!session) {
		throw new NotFoundError("ExecutionSession", executionSessionId);
	}
	return {
		workOrderId: session.workOrderId.toString(),
		status: "not_created",
		message: "No hay informe técnico generado para esta ejecución.",
	};
}

export async function createTechnicalReportFromExecutionSession(
	executionSessionId: string,
	input: CreateTechnicalReportInput,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const session = await ExecutionSession.findById(
		parseObjectId(executionSessionId, "executionSessionId"),
	);
	if (!session) {
		throw new NotFoundError("ExecutionSession", executionSessionId);
	}

	const existing = await TechnicalReport.findOne({
		executionSessionId: session._id,
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return formatTechnicalReport(existing);
	}

	const report = new TechnicalReport({
		code: await nextCode("TR", () => TechnicalReport.countDocuments().exec()),
		workOrderId: session.workOrderId,
		executionSessionId: session._id,
		serviceCaseId: session.serviceCaseId,
		executionSummary: buildReportSummary(executionSessionId, input),
		activitiesPerformed:
			input.executionSummary && input.executionSummary.trim().length > 0
				? [input.executionSummary.trim()]
				: [],
		findings: input.findings,
		deviations: input.deviations,
		evidenceIds: session.evidenceIds,
		documentIds: session.documentImportIds,
		generatedBy: parseObjectId(actor._id, "userId"),
		generatedAt: new Date(),
		status: "draft",
		clientMutationIds: input.clientMutationId ? [input.clientMutationId] : [],
	});
	await report.save();
	await updateServiceCaseArtifact(
		session.serviceCaseId,
		"technicalReport",
		toArtifactProjection(report),
		"technical_closure",
		[
			{
				command: "generate_technical_report",
				label: "Revisar y aprobar informe técnico",
				requiredRole: "gerente",
				route: `/reports/${report._id.toString()}`,
			},
		],
	);
	return formatTechnicalReport(report);
}

export async function generateTechnicalReport(
	id: string,
	input: GenerateTechnicalReportInput,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	if (input.executionSummary) {
		report.executionSummary = input.executionSummary.trim();
		report.activitiesPerformed = [input.executionSummary.trim()];
	}
	report.findings = input.findings;
	report.deviations = input.deviations;
	report.generatedBy = parseObjectId(actor._id, "userId");
	report.generatedAt = new Date();
	report.status = "generated";
	if (input.clientMutationId) {
		report.clientMutationIds.push(input.clientMutationId);
	}
	await report.save();
	await updateServiceCaseArtifact(
		report.serviceCaseId,
		"technicalReport",
		toArtifactProjection(report),
		"technical_closure",
		[
			{
				command: "approve_technical_report",
				label: "Aprobar informe técnico",
				requiredRole: "gerente",
				route: `/reports/${report._id.toString()}`,
			},
		],
	);
	return formatTechnicalReport(report);
}

export async function updateTechnicalReport(
	id: string,
	input: CreateTechnicalReportInput,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	if (input.executionSummary) {
		report.executionSummary = input.executionSummary.trim();
	}
	report.findings = input.findings;
	report.deviations = input.deviations;
	await report.save();
	return formatTechnicalReport(report);
}

export async function submitTechnicalReport(
	id: string,
	input: ApproveTechnicalReportInput,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	report.status = "reviewed";
	report.reviewedBy = parseObjectId(actor._id, "userId");
	report.reviewedAt = new Date();
	if (input.clientMutationId) {
		report.clientMutationIds.push(input.clientMutationId);
	}
	await report.save();
	return formatTechnicalReport(report);
}

export async function approveTechnicalReport(
	id: string,
	input: ApproveTechnicalReportInput,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	report.status = "approved";
	report.approvedBy = parseObjectId(actor._id, "userId");
	report.approvedAt = new Date();
	report.rejectionReason = undefined;
	if (input.clientMutationId) {
		report.clientMutationIds.push(input.clientMutationId);
	}
	await report.save();
	await Order.findByIdAndUpdate(report.workOrderId, { $set: { reportGenerated: true } });
	await updateServiceCaseArtifact(
		report.serviceCaseId,
		"technicalReport",
		toArtifactProjection(report),
		"technical_closure",
		[
			{
				command: "create_delivery_record",
				label: "Crear acta de entrega",
				requiredRole: "residente",
				route: "/delivery-records",
			},
		],
	);
	return formatTechnicalReport(report);
}

export async function rejectTechnicalReport(
	id: string,
	input: RejectTechnicalReportInput,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	report.status = "rejected";
	report.rejectedBy = parseObjectId(actor._id, "userId");
	report.rejectedAt = new Date();
	report.rejectionReason = input.reason.trim();
	if (input.clientMutationId) {
		report.clientMutationIds.push(input.clientMutationId);
	}
	await report.save();
	return formatTechnicalReport(report);
}

export async function cancelTechnicalReport(id: string): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	report.status = "cancelled";
	await report.save();
	return formatTechnicalReport(report);
}

export async function attachTechnicalReportEvidence(
	id: string,
	evidenceId: string,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	const objectId = parseObjectId(evidenceId, "evidenceId");
	if (!report.evidenceIds.some((current) => current.equals(objectId))) {
		report.evidenceIds.push(objectId);
		await report.save();
	}
	return formatTechnicalReport(report);
}

export async function attachTechnicalReportDocument(
	id: string,
	documentId: string,
): Promise<TechnicalReportResponse> {
	const report = await requireTechnicalReport(id);
	const objectId = parseObjectId(documentId, "documentId");
	if (!report.documentIds.some((current) => current.equals(objectId))) {
		report.documentIds.push(objectId);
		await report.save();
	}
	return formatTechnicalReport(report);
}

export async function listDeliveryRecords(
	filters: ListDeliveryRecordsQuery,
): Promise<ListEnvelope<DeliveryRecordResponse>> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? DEFAULT_LIMIT;
	const query: Record<string, Types.ObjectId | string> = {};
	const workOrderId = maybeObjectId(filters.workOrderId);
	const technicalReportId = maybeObjectId(filters.technicalReportId);
	if (workOrderId) {
		query.workOrderId = workOrderId;
	}
	if (technicalReportId) {
		query.technicalReportId = technicalReportId;
	}
	if (filters.status) {
		query.status = filters.status;
	}
	const [docs, total] = await Promise.all([
		DeliveryRecord.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		DeliveryRecord.countDocuments(query),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});
	return { data: docs.map(formatDeliveryRecord), total, page, limit, pages: pages(total, limit) };
}

export async function getDeliveryRecordById(id: string): Promise<DeliveryRecordResponse> {
	return formatDeliveryRecord(await requireDeliveryRecord(id));
}

export async function getDeliveryRecordByOrder(
	workOrderId: string,
): Promise<
	DeliveryRecordResponse | { workOrderId: string; status: "not_created"; message: string }
> {
	const record = await DeliveryRecord.findOne({
		workOrderId: parseObjectId(workOrderId, "workOrderId"),
		status: { $ne: "cancelled" },
	});
	return record
		? formatDeliveryRecord(record)
		: { workOrderId, status: "not_created", message: "No hay acta de entrega." };
}

export async function createDeliveryRecordFromTechnicalReport(
	technicalReportId: string,
	input: CreateDeliveryRecordV2Input,
	actor: WorkflowActor,
): Promise<DeliveryRecordResponse> {
	const report = await requireTechnicalReport(technicalReportId);
	if (report.status !== "approved") {
		throw new UnprocessableError(
			"Technical report must be approved before delivery record creation",
			"DELIVERY_RECORD_REPORT_NOT_APPROVED",
		);
	}
	const existing = await DeliveryRecord.findOne({
		technicalReportId: report._id,
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return formatDeliveryRecord(existing);
	}
	const record = new DeliveryRecord({
		code: await nextCode("DR", () => DeliveryRecord.countDocuments().exec()),
		workOrderId: report.workOrderId,
		technicalReportId: report._id,
		serviceCaseId: report.serviceCaseId,
		deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
		clientRepresentative: input.clientRepresentative,
		clientContact: input.clientContact,
		clientObservations: input.clientObservations,
		status: "draft",
		clientMutationIds: input.clientMutationId ? [input.clientMutationId] : [],
	});
	record.sentBy = parseObjectId(actor._id, "userId");
	await record.save();
	await updateServiceCaseArtifact(
		record.serviceCaseId,
		"deliveryRecord",
		toArtifactProjection(record),
		"administrative_closure",
		[
			{
				command: "send_delivery_record",
				label: "Enviar acta para firma",
				requiredRole: "residente",
				route: `/delivery-records`,
			},
		],
	);
	return formatDeliveryRecord(record);
}

export async function sendDeliveryRecord(
	id: string,
	input: SendDeliveryRecordInput,
	actor: WorkflowActor,
): Promise<DeliveryRecordResponse> {
	const record = await requireDeliveryRecord(id);
	record.status = "sent";
	record.sentAt = new Date();
	record.sentBy = parseObjectId(actor._id, "userId");
	if (input.clientMutationId) {
		record.clientMutationIds.push(input.clientMutationId);
	}
	await record.save();
	return formatDeliveryRecord(record);
}

export async function signDeliveryRecord(
	id: string,
	input: SignDeliveryRecordInput,
): Promise<DeliveryRecordResponse> {
	const record = await requireDeliveryRecord(id);
	record.status = "signed";
	record.acceptanceStatus = input.clientObservations ? "accepted_with_observations" : "accepted";
	record.signedDocumentRef = input.signedDocumentRef;
	record.signatureMethod = input.signatureMethod;
	record.signedAt = new Date(input.signedAt);
	record.signedBy = input.signedBy;
	record.clientObservations = input.clientObservations;
	if (input.clientMutationId) {
		record.clientMutationIds.push(input.clientMutationId);
	}
	await record.save();
	await updateServiceCaseArtifact(
		record.serviceCaseId,
		"deliveryRecord",
		toArtifactProjection(record),
		"ses_pending",
		[
			{
				command: "create_service_entry_sheet",
				label: "Crear SES / Ariba",
				requiredRole: "administrativo",
				route: "/billing/ses",
			},
		],
	);
	return formatDeliveryRecord(record);
}

export async function rejectDeliveryRecord(
	id: string,
	input: RejectDeliveryRecordInput,
	actor: WorkflowActor,
): Promise<DeliveryRecordResponse> {
	const record = await requireDeliveryRecord(id);
	record.status = "rejected";
	record.acceptanceStatus = "rejected";
	record.rejectedAt = new Date();
	record.rejectedBy = parseObjectId(actor._id, "userId");
	record.rejectionReason = input.reason.trim();
	await record.save();
	return formatDeliveryRecord(record);
}

export async function cancelDeliveryRecord(id: string): Promise<DeliveryRecordResponse> {
	const record = await requireDeliveryRecord(id);
	record.status = "cancelled";
	await record.save();
	return formatDeliveryRecord(record);
}

export async function listServiceEntrySheets(
	filters: ListServiceEntrySheetsQuery,
): Promise<ListEnvelope<ServiceEntrySheetResponse>> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? DEFAULT_LIMIT;
	const query: Record<string, Types.ObjectId | string | { $in: string[] }> = {};
	const workOrderId = maybeObjectId(filters.workOrderId);
	const clientId = maybeObjectId(filters.clientId);
	if (workOrderId) {
		query.workOrderId = workOrderId;
	}
	if (clientId) {
		query.clientId = clientId;
	}
	if (filters.status?.length) {
		query.status = { $in: filters.status };
	}
	const [docs, total] = await Promise.all([
		ServiceEntrySheet.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		ServiceEntrySheet.countDocuments(query),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});
	return {
		data: docs.map(formatServiceEntrySheet),
		total,
		page,
		limit,
		pages: pages(total, limit),
	};
}

export async function getServiceEntrySheetById(id: string): Promise<ServiceEntrySheetResponse> {
	return formatServiceEntrySheet(await requireServiceEntrySheet(id));
}

export async function getServiceEntrySheetByDeliveryRecord(
	deliveryRecordId: string,
): Promise<
	ServiceEntrySheetResponse | { deliveryRecordId: string; status: "not_created"; message: string }
> {
	const ses = await ServiceEntrySheet.findOne({
		deliveryRecordId: parseObjectId(deliveryRecordId, "deliveryRecordId"),
		status: { $ne: "cancelled" },
	});
	return ses
		? formatServiceEntrySheet(ses)
		: { deliveryRecordId, status: "not_created", message: "No hay SES creada." };
}

export async function createServiceEntrySheetFromDeliveryRecord(
	deliveryRecordId: string,
	input: CreateOrderServiceEntrySheetInput,
	actor: WorkflowActor,
): Promise<ServiceEntrySheetResponse> {
	const record = await requireDeliveryRecord(deliveryRecordId);
	if (record.status !== "signed") {
		throw new UnprocessableError(
			"Delivery record must be signed before SES creation",
			"SES_DELIVERY_RECORD_NOT_SIGNED",
		);
	}
	const existing = await ServiceEntrySheet.findOne({
		deliveryRecordId: record._id,
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return formatServiceEntrySheet(existing);
	}
	const order = await Order.findById(record.workOrderId);
	const ses = new ServiceEntrySheet({
		code: await nextCode("SES", () => ServiceEntrySheet.countDocuments().exec()),
		workOrderId: record.workOrderId,
		workOrderCode: order?.code,
		deliveryRecordId: record._id,
		technicalReportId: record.technicalReportId,
		serviceCaseId: record.serviceCaseId,
		clientId: parseObjectId(actor._id, "userId"),
		clientName: record.clientRepresentative || "Cliente asociado al acta",
		aribaDocumentNumber: input.aribaDocumentNumber,
		amount: input.subtotal,
		currency: input.currency,
		taxAmount: input.taxLines.reduce((sum, tax) => sum + tax.amount, 0),
		totalAmount: input.total,
		serviceLines: input.serviceLines,
		subtotal: input.subtotal,
		taxLines: input.taxLines,
		total: input.total,
		description: input.description,
		status: "draft",
		commandHistory: commandEntry(input.clientMutationId, "create_service_entry_sheet"),
		createdBy: parseObjectId(actor._id, "userId"),
	});
	await ses.save();
	await updateServiceCaseArtifact(
		ses.serviceCaseId,
		"serviceEntrySheet",
		toArtifactProjection(ses),
		"ses_pending",
		[
			{
				command: "submit_service_entry_sheet",
				label: "Enviar SES para aprobación",
				requiredRole: "administrativo",
				route: "/billing/ses",
			},
		],
	);
	return formatServiceEntrySheet(ses);
}

export async function submitServiceEntrySheet(
	id: string,
	input: SubmitServiceEntrySheetInput,
	actor: WorkflowActor,
): Promise<ServiceEntrySheetResponse> {
	const ses = await requireServiceEntrySheet(id);
	ses.status = "submitted";
	ses.submittedAt = new Date();
	ses.submittedBy = parseObjectId(actor._id, "userId");
	ses.commandHistory.push(...commandEntry(input.clientMutationId, "submit_service_entry_sheet"));
	await ses.save();
	return formatServiceEntrySheet(ses);
}

export async function approveServiceEntrySheet(
	id: string,
	input: ApproveServiceEntrySheetInput,
	actor: WorkflowActor,
): Promise<ServiceEntrySheetResponse> {
	const ses = await requireServiceEntrySheet(id);
	ses.status = "approved";
	ses.approvedAt = new Date();
	ses.approvedBy = parseObjectId(actor._id, "userId");
	ses.approverReference = input.approverReference;
	ses.rejectionReason = undefined;
	ses.commandHistory.push(...commandEntry(input.clientMutationId, "approve_service_entry_sheet"));
	await ses.save();
	await updateServiceCaseArtifact(
		ses.serviceCaseId,
		"serviceEntrySheet",
		toArtifactProjection(ses),
		"billing_pending",
		[
			{
				command: "create_invoice",
				label: "Crear factura",
				requiredRole: "administrativo",
				route: "/billing/invoices",
			},
		],
	);
	return formatServiceEntrySheet(ses);
}

export async function rejectServiceEntrySheet(
	id: string,
	input: RejectServiceEntrySheetInput,
	actor: WorkflowActor,
): Promise<ServiceEntrySheetResponse> {
	const ses = await requireServiceEntrySheet(id);
	ses.status = "rejected";
	ses.rejectedAt = new Date();
	ses.rejectedBy = parseObjectId(actor._id, "userId");
	ses.rejectionReason = input.reason.trim();
	ses.commandHistory.push(...commandEntry(input.clientMutationId, "reject_service_entry_sheet"));
	await ses.save();
	return formatServiceEntrySheet(ses);
}

export async function cancelServiceEntrySheet(id: string): Promise<ServiceEntrySheetResponse> {
	const ses = await requireServiceEntrySheet(id);
	ses.status = "cancelled";
	await ses.save();
	return formatServiceEntrySheet(ses);
}

export async function listInvoices(
	filters: ListInvoicesQuery,
): Promise<ListEnvelope<InvoiceResponse>> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? DEFAULT_LIMIT;
	const query: Record<string, Types.ObjectId | string | { $in: string[] }> = {};
	const workOrderId = maybeObjectId(filters.workOrderId);
	const clientId = maybeObjectId(filters.clientId);
	if (workOrderId) {
		query.workOrderId = workOrderId;
	}
	if (clientId) {
		query.clientId = clientId;
	}
	if (filters.status?.length) {
		query.status = { $in: filters.status };
	}
	const [docs, total] = await Promise.all([
		Invoice.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		Invoice.countDocuments(query),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});
	return { data: docs.map(formatInvoice), total, page, limit, pages: pages(total, limit) };
}

export async function getInvoiceById(id: string): Promise<InvoiceResponse> {
	return formatInvoice(await requireInvoice(id));
}

export async function createInvoiceFromServiceEntrySheet(
	serviceEntrySheetId: string,
	input: CreateOrderInvoiceInput,
	actor: WorkflowActor,
): Promise<InvoiceResponse> {
	const ses = await requireServiceEntrySheet(serviceEntrySheetId);
	if (ses.status !== "approved") {
		throw new UnprocessableError(
			"SES must be approved before invoice creation",
			"INVOICE_SES_NOT_APPROVED",
		);
	}
	const existing = await Invoice.findOne({
		serviceEntrySheetId: ses._id,
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return formatInvoice(existing);
	}
	const invoice = new Invoice({
		code: await nextCode("INV", () => Invoice.countDocuments().exec()),
		workOrderId: ses.workOrderId,
		workOrderCode: ses.workOrderCode,
		serviceEntrySheetId: ses._id,
		serviceEntrySheetCode: ses.code,
		serviceCaseId: ses.serviceCaseId,
		clientId: ses.clientId,
		clientName: ses.clientName,
		billingAccount: input.billingAccount || ses.billingAccount,
		invoiceNumber: input.invoiceNumber,
		amount: ses.amount,
		taxAmount: ses.taxAmount,
		totalAmount: ses.totalAmount,
		currency: ses.currency,
		issuedAt: new Date(input.issueDate),
		issueDate: new Date(input.issueDate),
		dueDate: new Date(input.dueDate),
		invoiceLines: ses.serviceLines,
		taxBreakdown: ses.taxLines,
		subtotal: ses.subtotal,
		total: ses.total,
		status: "issued",
		notes: input.notes,
		commandHistory: commandEntry(input.clientMutationId, "create_invoice"),
		createdBy: parseObjectId(actor._id, "userId"),
	});
	validateInvoiceAgainstSes(invoice, ses);
	await invoice.save();
	await updateServiceCaseArtifact(
		invoice.serviceCaseId,
		"invoice",
		toArtifactProjection(invoice),
		"receivable_open",
		[
			{
				command: "register_payment",
				label: "Registrar pago",
				requiredRole: "administrativo",
				route: "/payments",
			},
		],
		{
			status: "complete",
			invoiceTotal: invoice.totalAmount,
			outstandingAmount: invoice.totalAmount,
			currency: invoice.currency,
		},
	);
	return formatInvoice(invoice);
}

export async function submitInvoice(id: string, actor: WorkflowActor): Promise<InvoiceResponse> {
	const invoice = await requireInvoice(id);
	await assertPersistedInvoiceMatchesSes(invoice);
	invoice.status = "submitted";
	invoice.submittedAt = new Date();
	invoice.submittedBy = parseObjectId(actor._id, "userId");
	await invoice.save();
	return formatInvoice(invoice);
}

export async function approveInvoice(id: string, actor: WorkflowActor): Promise<InvoiceResponse> {
	const invoice = await requireInvoice(id);
	await assertPersistedInvoiceMatchesSes(invoice);
	invoice.status = "approved";
	invoice.approvedAt = new Date();
	invoice.approvedBy = parseObjectId(actor._id, "userId");
	await invoice.save();
	return formatInvoice(invoice);
}

export async function rejectInvoice(
	id: string,
	input: RejectServiceEntrySheetInput,
	actor: WorkflowActor,
): Promise<InvoiceResponse> {
	const invoice = await requireInvoice(id);
	invoice.status = "rejected";
	invoice.rejectedAt = new Date();
	invoice.rejectedBy = parseObjectId(actor._id, "userId");
	invoice.rejectionReason = input.reason.trim();
	await invoice.save();
	return formatInvoice(invoice);
}

export async function cancelInvoice(id: string): Promise<InvoiceResponse> {
	const invoice = await requireInvoice(id);
	invoice.status = "cancelled";
	await invoice.save();
	return formatInvoice(invoice);
}

export async function listPayments(
	filters: ListPaymentsQuery,
): Promise<ListEnvelope<PaymentResponse>> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? DEFAULT_LIMIT;
	const query: Record<string, Types.ObjectId | string> = {};
	const invoiceId = maybeObjectId(filters.invoiceId);
	const workOrderId = maybeObjectId(filters.workOrderId);
	const clientId = maybeObjectId(filters.clientId);
	if (invoiceId) {
		query.invoiceId = invoiceId;
	}
	if (workOrderId) {
		query.workOrderId = workOrderId;
	}
	if (clientId) {
		query.clientId = clientId;
	}
	if (filters.status) {
		query.status = filters.status;
	}
	const [docs, total] = await Promise.all([
		Payment.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		Payment.countDocuments(query),
	]).catch((error: unknown) => {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	});
	return { data: docs.map(formatPayment), total, page, limit, pages: pages(total, limit) };
}

export async function getPaymentById(id: string): Promise<PaymentResponse> {
	return formatPayment(await requirePayment(id));
}

export async function registerPaymentForInvoice(
	invoiceId: string,
	input: RegisterInvoicePaymentInput,
	actor: WorkflowActor,
): Promise<PaymentResponse> {
	const invoice = await requireInvoice(invoiceId);
	const existing = await Payment.findOne({
		invoiceId: invoice._id,
		paymentReference: input.paymentReference,
	});
	if (existing) {
		return formatPayment(existing);
	}
	if (!invoice.serviceEntrySheetId) {
		throw new UnprocessableError("Invoice is not linked to SES", "PAYMENT_INVOICE_WITHOUT_SES");
	}
	if (!PAYMENT_ELIGIBLE_INVOICE_STATUSES.has(invoice.status)) {
		throw new UnprocessableError(
			"Invoice must be approved before registering a payment",
			"PAYMENT_INVOICE_NOT_APPROVED",
		);
	}
	const amount = input.amount ?? invoice.totalAmount;
	const paidBefore = await getRecordedPaymentTotal(invoice._id);
	const outstandingAmount = Math.max(invoice.totalAmount - paidBefore, 0);
	if (amount > outstandingAmount) {
		throw new UnprocessableError(
			"Payment amount exceeds invoice outstanding balance",
			"PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING",
		);
	}
	const payment = new Payment({
		invoiceId: invoice._id,
		workOrderId: invoice.workOrderId,
		serviceEntrySheetId: invoice.serviceEntrySheetId,
		serviceCaseId: invoice.serviceCaseId,
		clientId: invoice.clientId,
		paymentReference: input.paymentReference,
		paidAt: new Date(input.paidAt),
		amount,
		currency: input.currency ?? invoice.currency,
		paymentMethod: input.paymentMethod,
		bankReference: input.bankReference,
		supportingDocument: input.supportingDocument,
		supportingDocumentUrl: input.supportingDocumentUrl,
		recordedBy: parseObjectId(actor._id, "userId"),
		recordedAt: new Date(),
		commandHistory: commandEntry(input.clientMutationId, "register_payment"),
		status: "recorded",
	});
	await payment.save();
	const paidTotal = paidBefore + payment.amount;
	invoice.status = paidTotal >= invoice.totalAmount ? "paid" : "partially_paid";
	invoice.paidAt = payment.paidAt;
	invoice.paymentReference = payment.paymentReference;
	await invoice.save();
	await updateServiceCaseArtifact(
		payment.serviceCaseId,
		"payment",
		toArtifactProjection({ ...payment, code: payment.paymentReference }),
		"receivable_open",
		[
			{
				command: "reconcile_payment",
				label: "Conciliar pago",
				requiredRole: "administrativo",
				route: "/payments",
			},
		],
		{
			status: "complete",
			invoiceTotal: invoice.totalAmount,
			paidTotal,
			outstandingAmount: Math.max(invoice.totalAmount - paidTotal, 0),
			currency: invoice.currency,
		},
	);
	return formatPayment(payment);
}

export async function reconcilePayment(
	id: string,
	input: ReconcilePaymentInput,
	actor: WorkflowActor,
): Promise<PaymentResponse> {
	const payment = await requirePayment(id);
	payment.status = "reconciled";
	payment.reconciledBy = parseObjectId(actor._id, "userId");
	payment.reconciledAt = new Date();
	payment.commandHistory.push(...commandEntry(input.clientMutationId, "reconcile_payment"));
	await payment.save();
	await updateServiceCaseArtifact(
		payment.serviceCaseId,
		"payment",
		toArtifactProjection({ ...payment, code: payment.paymentReference }),
		"paid",
		[],
		{
			status: "complete",
			paidTotal: payment.amount,
			outstandingAmount: 0,
			currency: payment.currency,
			paymentStatus: "reconciled",
		},
	);
	return formatPayment(payment);
}

export async function rejectPayment(
	id: string,
	input: RejectPaymentRecordInput,
	actor: WorkflowActor,
): Promise<PaymentResponse> {
	const payment = await requirePayment(id);
	payment.status = "rejected";
	payment.rejectedBy = parseObjectId(actor._id, "userId");
	payment.rejectedAt = new Date();
	payment.rejectionReason = input.rejectionReason.trim();
	payment.commandHistory.push(...commandEntry(input.clientMutationId, "reject_payment"));
	await payment.save();
	return formatPayment(payment);
}

export async function generateAutoDraftReport(
	serviceCaseId: string,
	actor: WorkflowActor,
): Promise<TechnicalReportResponse> {
	const sc = await ServiceCase.findById(serviceCaseId)
		.populate<{ clientId?: { name: string } }>("clientId", "name")
		.lean();
	if (!sc) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const sessions = await ExecutionSession.find({ serviceCaseId: sc._id })
		.sort({ createdAt: 1 })
		.lean();
	if (sessions.length === 0) {
		throw new BadRequestError("No execution sessions found for this service case");
	}

	const firstSession = sessions[0] as unknown as Record<string, unknown>;
	const workOrderIdStr: string =
		firstSession.workOrderId != null ? String(firstSession.workOrderId) : String(firstSession._id);
	const workOrderId = parseObjectId(workOrderIdStr, "workOrderId");

	const planning = await PlanningPacket.findOne({ workOrderId }).sort({ updatedAt: -1 }).lean();

	const now = new Date();
	const code = `TR-AUTO-${Date.now().toString(36).toUpperCase()}`;

	const sessionsRaw = sessions as unknown as Array<Record<string, unknown>>;

	const executionSummary = buildAutoDraftSummary(
		sc as Record<string, unknown>,
		sessionsRaw,
		planning as Record<string, unknown> | null,
	);
	const activities = extractAutoDraftActivities(sessionsRaw);
	const [findings, deviations] = extractAutoDraftFindings(sessionsRaw);

	const report = await TechnicalReport.create({
		code,
		workOrderId,
		executionSessionId: parseObjectId(String(firstSession._id), "executionSessionId"),
		serviceCaseId: sc._id,
		executionSummary,
		activitiesPerformed: activities,
		findings,
		deviations,
		evidenceIds: sessionsRaw.flatMap((s) =>
			Array.isArray(s.evidenceIds) ? (s.evidenceIds as Types.ObjectId[]) : [],
		),
		generatedBy: parseObjectId(actor._id, "userId"),
		generatedAt: now,
		status: "draft",
	});

	return formatTechnicalReport(report);
}

function buildAutoDraftSummary(
	sc: Record<string, unknown>,
	sessions: Array<Record<string, unknown>>,
	_planning: Record<string, unknown> | null,
): string {
	const clientName = (sc as { clientId?: { name: string } }).clientId?.name ?? "Cliente";
	const desc = String(sc.description ?? "Sin descripción");
	const sessionCount = sessions.length;
	const dates = sessions
		.map((s) => s.startedAt)
		.filter(Boolean)
		.sort() as string[];
	const startDate = dates.length > 0 ? new Date(dates[0]).toLocaleDateString("es-CO") : "N/A";
	const endDate =
		dates.length > 0 ? new Date(dates[dates.length - 1]).toLocaleDateString("es-CO") : "N/A";

	return [
		`Cliente: ${clientName}`,
		`Descripción: ${desc}`,
		`Sesiones de ejecución: ${sessionCount}`,
		`Período: ${startDate} - ${endDate}`,
	].join("\n");
}

function extractAutoDraftActivities(sessions: Array<Record<string, unknown>>): string[] {
	return sessions
		.filter(
			(s: Record<string, unknown>) =>
				Array.isArray(s.checklistResponses) && s.checklistResponses.length > 0,
		)
		.slice(0, 10)
		.map((_s: Record<string, unknown>, i: number) => `Sesión ${i + 1}: checklist completado`);
}

function extractAutoDraftFindings(sessions: Array<Record<string, unknown>>): [string[], string[]] {
	const findings: string[] = [];
	const deviations: string[] = [];

	for (const s of sessions) {
		collectIncidentFindings(s, findings);
		collectObservationDeviations(s, deviations);
	}

	return [findings.length > 0 ? findings : ["Sin hallazgos críticos"], deviations];
}

function isCriticalIncident(inc: Record<string, unknown>): boolean {
	return inc.severity === "critical" || inc.severity === "high";
}

function collectIncidentFindings(session: Record<string, unknown>, findings: string[]): void {
	const incidents = (Array.isArray(session.incidents) ? session.incidents : []) as Array<
		Record<string, unknown>
	>;
	for (const inc of incidents) {
		if (isCriticalIncident(inc)) {
			findings.push(String(inc.description ?? inc.observation ?? "Incidente registrado"));
		}
	}
}

function collectObservationDeviations(
	session: Record<string, unknown>,
	deviations: string[],
): void {
	const observations = (Array.isArray(session.observations) ? session.observations : []) as Array<
		Record<string, unknown>
	>;
	for (const obs of observations) {
		deviations.push(
			String(obs.text ?? obs.description ?? obs.observation ?? "Desviación registrada"),
		);
	}
}
