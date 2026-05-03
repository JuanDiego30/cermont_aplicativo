import fs from "node:fs/promises";
import path from "node:path";
import { PassThrough } from "node:stream";
import type {
	CreateWorkReportInput,
	EvidenceDocument,
	ListReportsQuery,
	OrderDocument,
	ReportMonthlyStats,
	ReportPipelineItem,
	ReportPipelineResponse,
	ReportPipelineSummary,
	UpdateWorkReportInput,
	WorkReportDocument,
	WorkReport as WorkReportResponse,
} from "@cermont/shared-types";
import archiver, { type Archiver } from "archiver";
import { Types } from "mongoose";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	UnprocessableError,
} from "../../_shared/common/errors";
import { saveFile } from "../../_shared/common/storage/local-storage";
import { createLogger, toIsoString } from "../../_shared/common/utils";
import { sendEmail } from "../../_shared/common/utils/email";
import { container } from "../../_shared/config/container";
import { getOrderSummary } from "../../costs/application/service";
import { generateOrderPdf } from "../../orders/application/pdf-generator.service";

const log = createLogger("report-service");
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}

	return new Types.ObjectId(value);
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

function sanitizeArchiveSegment(value: string): string {
	const sanitized = value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
	return sanitized || "file";
}

function resolveUploadPath(url: string): string | null {
	if (!url.startsWith("/uploads/")) {
		return null;
	}

	const relativePath = url.replace(/^\/uploads\//, "");
	const resolvedPath = path.resolve(UPLOAD_DIR, relativePath);

	return resolvedPath === UPLOAD_DIR || resolvedPath.startsWith(`${UPLOAD_DIR}${path.sep}`)
		? resolvedPath
		: null;
}

async function readLocalUpload(url: string): Promise<Buffer | null> {
	const filePath = resolveUploadPath(url);
	if (!filePath) {
		return null;
	}

	return fs.readFile(filePath).catch(() => null);
}

async function createZipBuffer(populate: (archive: Archiver) => Promise<void>): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const archive = archiver("zip", { zlib: { level: 9 } });
		const stream = new PassThrough();
		const chunks: Buffer[] = [];

		stream.on("data", (chunk: Buffer) => {
			chunks.push(Buffer.from(chunk));
		});
		stream.on("end", () => {
			resolve(Buffer.concat(chunks));
		});
		stream.on("error", reject);
		archive.on("error", reject);
		archive.pipe(stream);

		populate(archive)
			.then(() => archive.finalize())
			.catch(reject);
	});
}

function buildDraftTitle(orderCode: string): string {
	return `Work report ${orderCode}`;
}

function getArchivePeriodKey(value: Date | string | undefined): string | null {
	const isoValue = toIsoString(value);
	if (!isoValue) {
		return null;
	}

	return isoValue.slice(0, 7);
}

async function getArchiveEligibleOrders(): Promise<OrderDocument<Types.ObjectId>[]> {
	return container.orderRepository.findPaginated(
		{ status: { $in: ["closed", "cancelled"] } } as Record<string, unknown>,
		{ skip: 0, limit: 10000, sort: { completedAt: -1 } },
	);
}

function buildArchiveCsv(
	periodo: string,
	orders: OrderDocument<Types.ObjectId>[],
	reportsByOrderId: Map<string, WorkReportDocument>,
): string {
	const header = [
		"period",
		"order_code",
		"order_status",
		"asset_name",
		"location",
		"invoice_number",
		"invoice_status",
		"paid_at",
		"report_status",
		"report_title",
	].join(",");

	const rows = orders
		.filter((order) => getArchivePeriodKey(order.completedAt) === periodo)
		.map((order) => {
			const report = reportsByOrderId.get(order._id.toString());
			const values = [
				periodo,
				order.code,
				order.status,
				order.assetName,
				order.location,
				order.billing.invoiceNumber ?? "",
				order.billing.invoiceStatus,
				toIsoString(order.billing.paidAt) ?? "",
				report?.status ?? "",
				report?.title ?? "",
			];

			return values.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",");
		});

	return [header, ...rows].join("\n");
}

async function appendEvidenceFiles(
	archive: Archiver,
	order: OrderDocument<Types.ObjectId>,
	evidences: EvidenceDocument[],
): Promise<void> {
	const orderFolder = sanitizeArchiveSegment(order.code);

	for (const evidence of evidences) {
		const buffer = await readLocalUpload(evidence.url);
		if (!buffer) {
			continue;
		}

		const filename = sanitizeArchiveSegment(evidence.filename);
		archive.append(buffer, {
			name: `${orderFolder}/evidencias/${filename}`,
		});
	}
}

function formatReport(doc: WorkReportDocument): WorkReportResponse {
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
		createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
		updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
	};
}

async function ensureOrder(orderId: string) {
	const order = await container.orderRepository.findByIdLean(orderId);

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
		container.checklistRepository.findOneLean({ orderId: parseObjectId(orderId, "orderId") }),
		getOrderSummary(orderId),
		container.evidenceRepository.countDocuments({
			orderId: parseObjectId(orderId, "orderId"),
			deletedAt: null,
		}),
	]);

	if (!checklist || checklist.status !== "completed") {
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

function mapOrderToPipelineItem(
	order: OrderDocument<Types.ObjectId>,
	now: number,
	MS_PER_DAY: number,
): ReportPipelineItem {
	const completedAt = order.completedAt;
	const daysWaiting =
		completedAt && completedAt instanceof Date
			? Math.floor((now - completedAt.getTime()) / MS_PER_DAY)
			: -1;

	return {
		_id: order._id.toString(),
		code: order.code,
		type: order.type,
		status: order.status as ReportPipelineItem["status"],
		assetName: order.assetName,
		location: order.location,
		description: order.description,
		createdAt: toIsoString(order.createdAt) ?? null,
		completedAt: completedAt
			? completedAt instanceof Date
				? completedAt.toISOString()
				: new Date(completedAt).toISOString()
			: null,
		daysWaiting,
		createdBy:
			typeof order.createdBy === "object" && order.createdBy !== null
				? (order.createdBy as unknown as { toString(): string }).toString()
				: String(order.createdBy),
		reportId: null,
		reportStatus: null,
		reportSummary: null,
		pdfUrl: null,
	};
}

function calculateReportDiffDays(
	report: WorkReportDocument,
	orderCompletedAtMap: Map<string, Date | null>,
	MS_PER_DAY: number,
): number | null {
	const completedAt = orderCompletedAtMap.get(report.orderId.toString());
	const approvedAt =
		report.approvedAt instanceof Date
			? report.approvedAt
			: report.approvedAt
				? new Date(report.approvedAt)
				: null;

	if (completedAt && approvedAt) {
		return (approvedAt.getTime() - completedAt.getTime()) / MS_PER_DAY;
	}
	return null;
}

async function computeAverageApprovalDays(
	approvedReports: WorkReportDocument[],
	MS_PER_DAY: number,
): Promise<number | null> {
	if (approvedReports.length === 0) {
		return null;
	}

	const approvedOrderIdsList = approvedReports.map((r) => r.orderId.toString());
	const ordersWithDates = await container.orderRepository.findPaginated(
		{ _id: { $in: approvedOrderIdsList } },
		{ skip: 0, limit: 1000 },
	);

	const orderCompletedAtMap = new Map<string, Date | null>();
	for (const o of ordersWithDates) {
		const completedDate =
			o.completedAt instanceof Date
				? o.completedAt
				: o.completedAt
					? new Date(o.completedAt)
					: null;
		orderCompletedAtMap.set(o._id.toString(), completedDate);
	}

	let totalDays = 0;
	let count = 0;

	for (const report of approvedReports) {
		const diff = calculateReportDiffDays(report, orderCompletedAtMap, MS_PER_DAY);
		if (diff !== null) {
			totalDays += diff;
			count += 1;
		}
	}

	return count > 0 ? Math.round((totalDays / count) * 100) / 100 : null;
}

export const ReportService = {
	async create(data: CreateWorkReportInput, userId: string): Promise<WorkReportResponse> {
		const orderId = parseObjectId(data.orderId, "orderId");
		const preconditions = await ensureCreationPreconditions(orderId.toString());

		const existing = await container.workReportRepository.findOneLean({ orderId });
		if (existing) {
			return formatReport(existing);
		}

		const report = await container.workReportRepository.create({
			orderId: orderId.toString(),
			title: data.title.trim(),
			summary:
				data.summary?.trim() ||
				buildFallbackSummary(preconditions.orderCode, 1, 1, preconditions.hasEvidences ? 1 : 0),
			status: "draft",
			generatedBy: parseObjectId(userId, "userId").toString(),
			includesChecklist: preconditions.hasChecklist,
			includesCosts: preconditions.hasCosts,
			includesEvidences: preconditions.hasEvidences,
		});

		log.info("Work report created", { reportId: String(report._id), orderId: data.orderId });
		return formatReport(report);
	},

	async syncDraftForCompletedOrder(orderId: string, userId: string): Promise<WorkReportResponse> {
		const parsedOrderId = parseObjectId(orderId, "orderId");
		const preconditions = await ensureCreationPreconditions(orderId);
		const [evidenceCount, documentCount] = await Promise.all([
			container.evidenceRepository.countDocuments({
				orderId: parsedOrderId,
				deletedAt: null,
			}),
			container.documentRepository.countDocuments({
				order_id: parsedOrderId,
			}),
		]);

		const title = buildDraftTitle(preconditions.orderCode);
		const summary = [
			buildFallbackSummary(preconditions.orderCode, 1, 1, evidenceCount),
			`Supporting documents: ${documentCount}`,
		].join(". ");

		const existingReport = await container.workReportRepository.findByOrderIdLean(orderId);
		if (!existingReport) {
			return this.create(
				{
					orderId,
					title,
					summary,
				},
				userId,
			);
		}

		const report = await container.workReportRepository.findById(existingReport._id.toString());
		if (!report) {
			throw new NotFoundError("WorkReport", existingReport._id.toString());
		}

		report.title = title;
		report.summary = summary;
		report.includesChecklist = preconditions.hasChecklist;
		report.includesCosts = preconditions.hasCosts;
		report.includesEvidences = preconditions.hasEvidences;
		if (report.status !== "approved") {
			report.status = "draft";
			report.rejectionReason = undefined;
		}

		await container.workReportRepository.save(report);
		return formatReport(report);
	},

	async syncDraftAndGeneratePdf(orderId: string, userId: string): Promise<void> {
		await this.syncDraftForCompletedOrder(orderId, userId);
		await this.generatePdf(orderId);
	},

	async findAll(filters: ListReportsQuery): Promise<{
		data: WorkReportResponse[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;

		const query: Record<string, unknown> = {};

		if (filters.orderId) {
			query.orderId = parseObjectId(filters.orderId, "orderId");
		}

		if (filters.status) {
			query.status = filters.status;
		}

		const result = await container.workReportRepository.findAll(query, page, limit);

		return {
			data: result.data.map(formatReport),
			total: result.total,
			page,
			limit,
			pages: Math.max(Math.ceil(result.total / Math.max(limit, 1)), 1),
		};
	},

	async findByOrderId(orderId: string): Promise<WorkReportResponse | null> {
		const report = await container.workReportRepository.findOneLean({
			orderId: parseObjectId(orderId, "orderId"),
		});
		return report ? formatReport(report) : null;
	},

	async findById(id: string): Promise<WorkReportResponse> {
		const report = await container.workReportRepository.findByIdLean(id);

		if (!report) {
			throw new NotFoundError("WorkReport", id);
		}

		return formatReport(report);
	},

	async update(
		id: string,
		updates: UpdateWorkReportInput,
		userId: string,
	): Promise<WorkReportResponse> {
		const report = await container.workReportRepository.findById(id);

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

		await container.workReportRepository.save(report);

		log.info("Work report updated", { reportId: id, userId });
		return formatReport(report);
	},

	async approveReport(id: string, userId: string, userRole: string): Promise<WorkReportResponse> {
		if (!["supervisor", "gerente"].includes(userRole)) {
			throw new ForbiddenError("Only supervisor or gerente can approve work reports");
		}

		const report = await container.workReportRepository.findById(id);
		if (!report) {
			throw new NotFoundError("WorkReport", id);
		}

		const order = await container.orderRepository.findByIdLean(report.orderId.toString());

		report.status = "approved";
		report.approvedBy = parseObjectId(userId, "userId").toString();
		report.approvedAt = new Date();
		report.rejectionReason = undefined;
		await container.workReportRepository.save(report);

		log.info("Work report approved", { reportId: id, userId });

		// Email Trigger
		if (order?.clientEmail) {
			await sendEmail({
				to: order.clientEmail,
				subject: `Informe de Servicio Aprobado - ${order.code}`,
				html: `
					<h1>Informe de Servicio</h1>
					<p>Estimado Cliente,</p>
					<p>Le informamos que el informe para la orden <strong>${order.code}</strong> ha sido aprobado.</p>
					<p>Puede descargarlo desde el portal del cliente.</p>
				`,
			});
		}

		return formatReport(report);
	},

	async closeReport(id: string, userId: string, userRole: string): Promise<WorkReportResponse> {
		return this.approveReport(id, userId, userRole);
	},

	async rejectReport(
		id: string,
		reason: string,
		userId: string,
		userRole: string,
	): Promise<WorkReportResponse> {
		if (!["supervisor", "gerente"].includes(userRole)) {
			throw new ForbiddenError("Only supervisor or gerente can reject work reports");
		}

		const report = await container.workReportRepository.findById(id);
		if (!report) {
			throw new NotFoundError("WorkReport", id);
		}

		report.status = "rejected";
		report.rejectionReason = reason;
		report.approvedBy = undefined;
		report.approvedAt = undefined;
		await container.workReportRepository.save(report);

		log.info("Work report rejected", { reportId: id, userId });

		// Email Trigger for internal rejection (to generation user)
		const generator = await container.userRepository.findByIdLean(report.generatedBy.toString());
		if (generator?.email) {
			await sendEmail({
				to: generator.email,
				subject: `Informe de Servicio Rechazado - OT ${id}`,
				html: `
					<h1>Revisión de Informe</h1>
					<p>Su informe ha sido rechazado por el supervisor.</p>
					<p><strong>Motivo:</strong> ${reason}</p>
					<p>Por favor realice las correcciones necesarias.</p>
				`,
			});
		}

		return formatReport(report);
	},

	async generatePdf(orderId: string): Promise<{ buffer: Buffer; report: WorkReportResponse }> {
		const order = await ensureOrder(orderId);
		const report = await container.workReportRepository.findOneLean({
			orderId: parseObjectId(orderId, "orderId"),
		});

		if (!report) {
			throw new NotFoundError("WorkReport", orderId);
		}

		const buffer = await generateOrderPdf({ orderId, type: "technical" });
		const fileName = buildPdfFilename(order.code, report._id.toString());
		const pdfPath = await saveFile(fileName, buffer);

		const reportDoc = await container.workReportRepository.findById(report._id.toString());
		if (reportDoc) {
			reportDoc.pdfPath = pdfPath;
			await container.workReportRepository.save(reportDoc);
		}

		log.info("Work report PDF generated", { orderId, reportId: report._id.toString(), pdfPath });
		return { buffer, report: formatReport(reportDoc || report) };
	},

	async getEvidenceZip(orderId: string): Promise<{ buffer: Buffer; filename: string }> {
		const order = await ensureOrder(orderId);
		const parsedOrderId = parseObjectId(orderId, "orderId");
		const [pdfResult, evidences] = await Promise.all([
			this.generatePdf(orderId),
			container.evidenceRepository.findLean(
				{ orderId: parsedOrderId, deletedAt: null },
				{ capturedAt: 1 },
			),
		]);
		const buffer = await createZipBuffer(async (archive) => {
			archive.append(pdfResult.buffer, {
				name: `${sanitizeArchiveSegment(order.code)}/informe-${sanitizeArchiveSegment(order.code)}.pdf`,
			});
			await appendEvidenceFiles(archive, order, evidences);
		});

		return {
			buffer,
			filename: `evidencias-${sanitizeArchiveSegment(order.code)}.zip`,
		};
	},

	async getBulkEvidenceZip(orderIds: string[]): Promise<{ buffer: Buffer; filename: string }> {
		const uniqueOrderIds = Array.from(new Set(orderIds));
		const buffer = await createZipBuffer(async (archive) => {
			for (const orderId of uniqueOrderIds) {
				const order = await ensureOrder(orderId);
				const parsedOrderId = parseObjectId(orderId, "orderId");
				const [pdfResult, evidences] = await Promise.all([
					this.generatePdf(orderId),
					container.evidenceRepository.findLean(
						{ orderId: parsedOrderId, deletedAt: null },
						{ capturedAt: 1 },
					),
				]);

				archive.append(pdfResult.buffer, {
					name: `${sanitizeArchiveSegment(order.code)}/informe-${sanitizeArchiveSegment(order.code)}.pdf`,
				});
				await appendEvidenceFiles(archive, order, evidences);
			}
		});

		return {
			buffer,
			filename: "evidencias-reportes.zip",
		};
	},

	async getArchivePeriods(): Promise<Array<{ periodo: string; count: number }>> {
		const orders = await getArchiveEligibleOrders();
		const periodMap = new Map<string, number>();

		for (const order of orders) {
			const key = getArchivePeriodKey(order.completedAt);
			if (!key) {
				continue;
			}

			periodMap.set(key, (periodMap.get(key) ?? 0) + 1);
		}

		return Array.from(periodMap.entries())
			.map(([periodo, count]) => ({ periodo, count }))
			.sort((left, right) => right.periodo.localeCompare(left.periodo));
	},

	async getArchivedReportsByPeriod(periodo: string): Promise<WorkReportResponse[]> {
		const orders = await getArchiveEligibleOrders();
		const matchingOrderIds = orders
			.filter((order) => getArchivePeriodKey(order.completedAt) === periodo)
			.map((order) => order._id.toString());

		if (matchingOrderIds.length === 0) {
			return [];
		}

		const reports = await container.workReportRepository.findAll(
			{ orderId: { $in: matchingOrderIds } },
			1,
			5000,
		);

		return reports.data.map(formatReport);
	},

	async downloadArchiveCsv(periodo: string): Promise<string> {
		const orders = await getArchiveEligibleOrders();
		const matchingOrders = orders.filter(
			(order) => getArchivePeriodKey(order.completedAt) === periodo,
		);

		if (matchingOrders.length === 0) {
			return buildArchiveCsv(periodo, [], new Map());
		}

		const reports = await container.workReportRepository.findAll(
			{ orderId: { $in: matchingOrders.map((order) => order._id.toString()) } },
			1,
			5000,
		);
		const reportsByOrderId = new Map(
			reports.data.map((report) => [report.orderId.toString(), report]),
		);

		return buildArchiveCsv(periodo, matchingOrders, reportsByOrderId);
	},

	async getReportPipeline(): Promise<ReportPipelineResponse> {
		const now = Date.now();
		const MS_PER_DAY = 86_400_000;

		const completedOrders = await container.orderRepository.findPaginated(
			{ status: { $in: ["completed", "ready_for_invoicing"] } },
			{ skip: 0, limit: 1000, sort: { completedAt: 1 } },
		);

		const approvedReportsResult = await container.workReportRepository.findAll(
			{ status: "approved", approvedAt: { $exists: true } },
			1,
			1000,
		);
		const approvedReports = approvedReportsResult.data;
		const approvedOrderIds = new Set(approvedReports.map((r) => r.orderId.toString()));

		const pipelineOrders = completedOrders.filter(
			(order) => !approvedOrderIds.has(order._id.toString()),
		);

		const pipelineOrderIds = pipelineOrders.map((order) => order._id.toString());
		const pipelineReportsResult = await container.workReportRepository.findAll(
			{ orderId: { $in: pipelineOrderIds } },
			1,
			pipelineOrderIds.length || 1,
		);

		const reportByOrderId = new Map<string, WorkReportDocument>();
		for (const report of pipelineReportsResult.data) {
			reportByOrderId.set(report.orderId.toString(), report);
		}

		const pipelineItems: ReportPipelineItem[] = pipelineOrders.map((order) => {
			const item = mapOrderToPipelineItem(order, now, MS_PER_DAY);
			const report = reportByOrderId.get(order._id.toString());
			if (report) {
				item.reportId = report._id.toString();
				item.reportStatus = report.status;
				item.reportSummary = report.summary;
				item.pdfUrl = report.pdfPath ? `/api/reports/order/${report.orderId.toString()}/pdf` : null;
			} else {
				item.reportId = null;
				item.reportStatus = null;
				item.reportSummary = null;
				item.pdfUrl = null;
			}
			return item;
		});

		const averageCompletionToApprovalDays = await computeAverageApprovalDays(
			approvedReports,
			MS_PER_DAY,
		);

		const validDays = pipelineItems
			.filter((item) => item.daysWaiting >= 0)
			.map((item) => item.daysWaiting);

		const summary: ReportPipelineSummary = {
			totalAwaitingApproval: pipelineItems.length,
			averageDaysWaiting:
				validDays.length > 0
					? Math.round((validDays.reduce((a, b) => a + b, 0) / validDays.length) * 100) / 100
					: 0,
			maxDaysWaiting: validDays.length > 0 ? Math.max(...validDays) : 0,
			averageCompletionToApprovalDays,
		};

		return {
			pipeline: pipelineItems,
			summary,
		};
	},

	async getMonthlyStats(): Promise<ReportMonthlyStats> {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const MS_PER_DAY = 86_400_000;

		const [approvedResult, rejectedResult] = await Promise.all([
			container.workReportRepository.findAll(
				{ status: "approved", approvedAt: { $gte: startOfMonth } },
				1,
				5000,
			),
			container.workReportRepository.findAll(
				{ status: "rejected", updatedAt: { $gte: startOfMonth } },
				1,
				5000,
			),
		]);

		const avgClosureDays = await computeAverageApprovalDays(approvedResult.data, MS_PER_DAY);

		return {
			approvedThisMonth: approvedResult.data.length,
			rejectedThisMonth: rejectedResult.data.length,
			avgClosureDays,
		};
	},
};
