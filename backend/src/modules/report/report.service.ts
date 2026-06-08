import type {
	CreateWorkReportInput,
	ListReportsQuery,
	UpdateWorkReportInput,
	WorkReport as WorkReportResponse,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	UnprocessableError,
} from "../../common/errors/AppError";
import { saveFile } from "../../common/storage/local-storage";
import { createLogger } from "../../common/utils/logger";
import { Checklist, Evidence, Order, WorkReport } from "../../models";
import type { IWorkReportDocument } from "../../models/WorkReport";
import { getOrderSummary } from "../../modules/cost/cost.service";
import { generateOrderPdf } from "../../services/pdf-generator.service";

const log = createLogger("report-service");

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}

	return new Types.ObjectId(value);
}

function toIsoString(value: Date | string | undefined): string | undefined {
	if (!value) {
		return undefined;
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function buildFallbackSummary(
	orderCode: string,
	checklistCount: number,
	costCount: number,
	evidenceCount: number,
): string {
	return [
		`Work report for order ${orderCode}`,
		`Checklist records: ${checklistCount}`,
		`Cost records: ${costCount}`,
		`Evidence records: ${evidenceCount}`,
	].join(". ");
}

function buildPdfFilename(orderCode: string, reportId: string): string {
	const safeOrderCode = orderCode.replace(/[^a-zA-Z0-9-_]+/g, "_");
	return `work-report-${safeOrderCode}-${reportId}.pdf`;
}

function formatReport(doc: IWorkReportDocument): WorkReportResponse {
	return {
		_id: doc._id.toString(),
		orderId: doc.orderId.toString(),
		title: doc.title,
		summary: doc.summary,
		status: doc.status,
		generatedBy: doc.generatedBy.toString(),
		approvedBy: doc.approvedBy?.toString(),
		approvedAt: toIsoString(doc.approvedAt),
		rejectionReason: doc.rejectionReason,
		pdfUrl: doc.pdfPath ? `/api/reports/order/${doc.orderId.toString()}/pdf` : undefined,
		includesChecklist: doc.includesChecklist,
		includesCosts: doc.includesCosts,
		includesEvidences: doc.includesEvidences,
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

async function ensureOrder(orderId: string) {
	const order = await Order.findById(orderId).lean();

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	return order;
}

async function ensureCreationPreconditions(orderId: string): Promise<{
	orderCode: string;
	hasChecklist: boolean;
	hasCosts: boolean;
	hasEvidences: boolean;
}> {
	const order = await ensureOrder(orderId);

	if (order.status !== "completed" && order.status !== "closed") {
		throw new UnprocessableError(
			"The order must be completed before creating a report",
			"REPORT_ORDER_NOT_COMPLETED",
		);
	}

	const [checklist, costSummary, evidenceCount] = await Promise.all([
		Checklist.findOne({ orderId: parseObjectId(orderId, "orderId") }).lean(),
		getOrderSummary(orderId),
		Evidence.countDocuments({ orderId: parseObjectId(orderId, "orderId"), deletedAt: null }),
	]);

	if (checklist?.status !== "completed") {
		throw new UnprocessableError(
			"The checklist must be completed before creating a report",
			"REPORT_CHECKLIST_INCOMPLETE",
		);
	}

	if (!costSummary.hasCosts) {
		throw new UnprocessableError(
			"The order must contain at least one cost before creating a report",
			"REPORT_NO_COSTS",
		);
	}

	return {
		orderCode: order.code,
		hasChecklist: true,
		hasCosts: true,
		hasEvidences: evidenceCount > 0,
	};
}

async function createReport(
	data: CreateWorkReportInput,
	userId: string,
): Promise<WorkReportResponse> {
	const orderId = parseObjectId(data.orderId, "orderId");
	const preconditions = await ensureCreationPreconditions(orderId.toString());

	const existing = await WorkReport.findOne({ orderId }).lean();
	if (existing) {
		return formatReport(existing);
	}

	const report = new WorkReport({
		orderId,
		title: data.title.trim(),
		summary:
			data.summary?.trim() ||
			buildFallbackSummary(preconditions.orderCode, 1, 1, preconditions.hasEvidences ? 1 : 0),
		status: "draft",
		generatedBy: parseObjectId(userId, "userId"),
		includesChecklist: preconditions.hasChecklist,
		includesCosts: preconditions.hasCosts,
		includesEvidences: preconditions.hasEvidences,
	});

	await report.save();

	log.info("Work report created", { reportId: String(report._id), orderId: data.orderId });
	return formatReport(report);
}

async function findAllReports(filters: ListReportsQuery): Promise<{
	data: WorkReportResponse[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? 20;
	const skip = (page - 1) * limit;

	const query: Record<string, unknown> = {};

	if (filters.orderId) {
		query.orderId = parseObjectId(filters.orderId, "orderId");
	}

	if (filters.status) {
		query.status = filters.status;
	}

	const [data, total] = await Promise.all([
		WorkReport.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		WorkReport.countDocuments(query),
	]);

	return {
		data: data.map(formatReport),
		total,
		page,
		limit,
		pages: Math.max(Math.ceil(total / Math.max(limit, 1)), 1),
	};
}

async function findReportByOrderId(orderId: string): Promise<WorkReportResponse | null> {
	const report = await WorkReport.findOne({ orderId: parseObjectId(orderId, "orderId") }).lean();
	return report ? formatReport(report as unknown as IWorkReportDocument) : null;
}

async function findReportById(id: string): Promise<WorkReportResponse> {
	const report = await WorkReport.findById(parseObjectId(id, "reportId")).lean();

	if (!report) {
		throw new NotFoundError("WorkReport", id);
	}

	return formatReport(report as unknown as IWorkReportDocument);
}

async function updateReport(
	id: string,
	updates: UpdateWorkReportInput,
	userId: string,
): Promise<WorkReportResponse> {
	const report = await WorkReport.findById(parseObjectId(id, "reportId"));

	if (!report) {
		throw new NotFoundError("WorkReport", id);
	}

	if (updates.title !== undefined) {
		report.title = updates.title.trim();
	}

	if (updates.summary !== undefined) {
		report.summary = updates.summary.trim();
	}

	if (updates.status !== undefined) {
		report.status = updates.status;
	}

	if (updates.rejectionReason !== undefined) {
		report.rejectionReason = updates.rejectionReason.trim() || undefined;
	}

	report.markModified("updatedAt");
	await report.save();

	log.info("Work report updated", { reportId: id, userId });
	return formatReport(report);
}

async function approveReport(
	id: string,
	userId: string,
	userRole: string,
): Promise<WorkReportResponse> {
	if (!["supervisor", "gerente"].includes(userRole)) {
		throw new ForbiddenError("Only supervisor or gerente can approve work reports");
	}

	const report = await WorkReport.findById(parseObjectId(id, "reportId"));
	if (!report) {
		throw new NotFoundError("WorkReport", id);
	}

	report.status = "approved";
	report.approvedBy = parseObjectId(userId, "userId");
	report.approvedAt = new Date();
	report.rejectionReason = undefined;
	await report.save();

	log.info("Work report approved", { reportId: id, userId });
	return formatReport(report);
}

async function closeReport(
	id: string,
	userId: string,
	userRole: string,
): Promise<WorkReportResponse> {
	return approveReport(id, userId, userRole);
}

async function rejectReport(
	id: string,
	reason: string,
	userId: string,
	userRole: string,
): Promise<WorkReportResponse> {
	if (!["supervisor", "gerente"].includes(userRole)) {
		throw new ForbiddenError("Only supervisor or gerente can reject work reports");
	}

	const report = await WorkReport.findById(parseObjectId(id, "reportId"));
	if (!report) {
		throw new NotFoundError("WorkReport", id);
	}

	report.status = "rejected";
	report.rejectionReason = reason;
	report.approvedBy = undefined;
	report.approvedAt = undefined;
	await report.save();

	log.info("Work report rejected", { reportId: id, userId });
	return formatReport(report);
}

async function generateReportPdf(
	orderId: string,
): Promise<{ buffer: Buffer; report: WorkReportResponse }> {
	const order = await ensureOrder(orderId);
	const report = await WorkReport.findOne({ orderId: parseObjectId(orderId, "orderId") });

	if (!report) {
		throw new NotFoundError("WorkReport", orderId);
	}

	const buffer = await generateOrderPdf({ orderId, type: "technical" });
	const fileName = buildPdfFilename(order.code, report._id.toString());
	const pdfPath = await saveFile(fileName, buffer);

	report.pdfPath = pdfPath;
	await report.save();

	log.info("Work report PDF generated", { orderId, reportId: report._id.toString(), pdfPath });
	return { buffer, report: formatReport(report) };
}

async function getArchivePeriods(): Promise<Array<{ periodo: string; count: number }>> {
	return [];
}

async function getArchivedReportsByPeriod(_periodo: string): Promise<WorkReportResponse[]> {
	return [];
}

export const ReportService = {
	create: createReport,
	findAll: findAllReports,
	findByOrderId: findReportByOrderId,
	findById: findReportById,
	update: updateReport,
	approveReport,
	closeReport,
	rejectReport,
	generatePdf: generateReportPdf,
	getArchivePeriods,
	getArchivedReportsByPeriod,
} as const;
