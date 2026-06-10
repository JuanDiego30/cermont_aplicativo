import type {
	CompleteSiteVisitRecordInput,
	CreateSiteVisitRecordInput,
	SiteVisitRecord,
	UpdateSiteVisitRecordInput,
} from "@cermont/shared-types";
import { AppError, ServiceUnavailableError } from "../../common/errors";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { Counter } from "../../models";
import { type SiteVisitDocument, SiteVisitModel } from "../../models/SiteVisit";

type SiteVisitMeasurementRecord = SiteVisitRecord["measurements"][number];
type SiteVisitFindingRecord = SiteVisitRecord["findings"][number];
type SiteVisitPhotoRecord = SiteVisitRecord["photos"][number];
type SiteVisitCommandHistoryRecord = SiteVisitRecord["commandHistory"][number];

interface SiteVisitListFilter {
	workRequestId?: string;
	clientId?: string;
	status?: string;
}

function formatCode(sequence: number, year: number): string {
	return `SV-${year}-${String(sequence).padStart(4, "0")}`;
}

async function generateCode(): Promise<string> {
	const now = new Date();
	const year = now.getFullYear();
	const sequence = await Counter.inc(`SV-${year}`);
	return formatCode(sequence, year);
}

function toIsoString(value: Date): string {
	return value.toISOString();
}

function mapMeasurement(
	measurement: SiteVisitDocument["measurements"][number],
): SiteVisitMeasurementRecord {
	return typeof measurement.unit === "string"
		? {
				label: measurement.label,
				value: measurement.value,
				unit: measurement.unit,
			}
		: {
				label: measurement.label,
				value: measurement.value,
			};
}

function mapFinding(finding: SiteVisitDocument["findings"][number]): SiteVisitFindingRecord {
	return {
		description: finding.description,
		severity: finding.severity,
		category: finding.category,
	};
}

function mapPhoto(photo: SiteVisitDocument["photos"][number]): SiteVisitPhotoRecord {
	return typeof photo.takenAt === "undefined"
		? {
				url: photo.url,
				...(typeof photo.caption === "string" ? { caption: photo.caption } : {}),
			}
		: {
				url: photo.url,
				...(typeof photo.caption === "string" ? { caption: photo.caption } : {}),
				takenAt: toIsoString(photo.takenAt),
			};
}

function mapCommandHistory(
	entry: SiteVisitDocument["commandHistory"][number],
): SiteVisitCommandHistoryRecord {
	return {
		clientMutationId: entry.clientMutationId,
		command: entry.command,
		recordedAt: toIsoString(entry.recordedAt),
	};
}

function toRecord(doc: SiteVisitDocument): SiteVisitRecord {
	return {
		_id: doc._id.toString(),
		code: doc.code,
		workRequestId: doc.workRequestId.toString(),
		serviceCaseId: doc.serviceCaseId.toString(),
		clientId: doc.clientId.toString(),
		clientName: doc.clientName,
		visitDate: toIsoString(doc.visitDate),
		location: doc.location,
		responsibleUserId: doc.responsibleUserId.toString(),
		responsibleName: doc.responsibleName,
		measurements: doc.measurements.map(mapMeasurement),
		findings: doc.findings.map(mapFinding),
		photos: doc.photos.map(mapPhoto),
		commandHistory: doc.commandHistory.map(mapCommandHistory),
		status: doc.status as SiteVisitRecord["status"],
		createdBy: doc.createdBy.toString(),
		createdAt: toIsoString(doc.createdAt),
		updatedAt: toIsoString(doc.updatedAt),
		...(typeof doc.requirements === "string" ? { requirements: doc.requirements } : {}),
		...(typeof doc.identifiedRisks === "string" ? { identifiedRisks: doc.identifiedRisks } : {}),
		...(typeof doc.recommendations === "string" ? { recommendations: doc.recommendations } : {}),
		...(typeof doc.observations === "string" ? { observations: doc.observations } : {}),
		...(doc.startedAt instanceof Date ? { startedAt: toIsoString(doc.startedAt) } : {}),
		...(doc.completedAt instanceof Date ? { completedAt: toIsoString(doc.completedAt) } : {}),
		...(doc.cancelledAt instanceof Date ? { cancelledAt: toIsoString(doc.cancelledAt) } : {}),
		...(typeof doc.cancellationReason === "string"
			? { cancellationReason: doc.cancellationReason }
			: {}),
	};
}

export async function listSiteVisits(query: {
	page: number;
	limit: number;
	workRequestId?: string;
	clientId?: string;
	status?: string;
}): Promise<{
	data: SiteVisitRecord[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const filter: SiteVisitListFilter = {};
	if (query.workRequestId) {
		filter.workRequestId = query.workRequestId;
	}
	if (query.clientId) {
		filter.clientId = query.clientId;
	}
	if (query.status) {
		filter.status = query.status;
	}

	let docs: SiteVisitDocument[];
	let total: number;

	try {
		[docs, total] = await Promise.all([
			SiteVisitModel.find(filter)
				.sort({ createdAt: -1 })
				.skip((query.page - 1) * query.limit)
				.limit(query.limit),
			SiteVisitModel.countDocuments(filter),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

	return {
		data: docs.map(toRecord),
		total,
		page: query.page,
		limit: query.limit,
		pages: Math.ceil(total / query.limit),
	};
}

export async function getSiteVisitById(id: string): Promise<SiteVisitRecord> {
	const doc = await SiteVisitModel.findById(id);
	if (!doc) {
		throw new AppError("Site visit not found", 404, "SITE_VISIT_NOT_FOUND");
	}
	return toRecord(doc);
}

export async function createSiteVisit(
	input: CreateSiteVisitRecordInput,
	userId: string,
): Promise<SiteVisitRecord> {
	const code = await generateCode();
	const doc = await SiteVisitModel.create({
		...input,
		code,
		status: "scheduled",
		createdBy: userId,
	});
	return toRecord(doc);
}

export async function updateSiteVisit(
	id: string,
	input: UpdateSiteVisitRecordInput,
): Promise<SiteVisitRecord> {
	const doc = await SiteVisitModel.findByIdAndUpdate(id, { $set: input }, { new: true });
	if (!doc) {
		throw new AppError("Site visit not found", 404, "SITE_VISIT_NOT_FOUND");
	}
	return toRecord(doc);
}

export async function startSiteVisit(
	id: string,
	clientMutationId?: string,
): Promise<SiteVisitRecord> {
	const doc = await SiteVisitModel.findById(id);
	if (!doc) {
		throw new AppError("Site visit not found", 404, "SITE_VISIT_NOT_FOUND");
	}
	if (doc.status !== "scheduled") {
		throw new AppError("Only scheduled visits can be started", 400, "SITE_VISIT_INVALID_STATUS");
	}

	doc.status = "in_progress";
	doc.startedAt = new Date();
	if (clientMutationId) {
		doc.commandHistory.push({ clientMutationId, command: "start", recordedAt: new Date() });
	}
	await doc.save();
	return toRecord(doc);
}

export async function completeSiteVisit(
	id: string,
	input: CompleteSiteVisitRecordInput,
): Promise<SiteVisitRecord> {
	const doc = await SiteVisitModel.findById(id);
	if (!doc) {
		throw new AppError("Site visit not found", 404, "SITE_VISIT_NOT_FOUND");
	}
	if (doc.status !== "in_progress") {
		throw new AppError(
			"Only in-progress visits can be completed",
			400,
			"SITE_VISIT_INVALID_STATUS",
		);
	}

	doc.status = "completed";
	doc.completedAt = new Date();
	doc.measurements = input.measurements ?? [];
	doc.findings = input.findings ?? [];
	doc.photos = (input.photos ?? []).map((p) => ({
		url: p.url,
		caption: p.caption,
		takenAt: p.takenAt ? new Date(p.takenAt) : undefined,
	})) as SiteVisitDocument["photos"];
	if (input.identifiedRisks) {
		doc.identifiedRisks = input.identifiedRisks;
	}
	if (input.recommendations) {
		doc.recommendations = input.recommendations;
	}
	if (input.observations) {
		doc.observations = input.observations;
	}
	if (input.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "complete",
			recordedAt: new Date(),
		});
	}
	await doc.save();
	return toRecord(doc);
}

export async function cancelSiteVisit(
	id: string,
	reason: string,
	clientMutationId?: string,
): Promise<SiteVisitRecord> {
	const doc = await SiteVisitModel.findById(id);
	if (!doc) {
		throw new AppError("Site visit not found", 404, "SITE_VISIT_NOT_FOUND");
	}
	if (doc.status === "completed" || doc.status === "cancelled") {
		throw new AppError(
			"Completed or already cancelled visits cannot be cancelled",
			400,
			"SITE_VISIT_INVALID_STATUS",
		);
	}

	doc.status = "cancelled";
	doc.cancelledAt = new Date();
	doc.cancellationReason = reason;
	if (clientMutationId) {
		doc.commandHistory.push({ clientMutationId, command: "cancel", recordedAt: new Date() });
	}
	await doc.save();
	return toRecord(doc);
}
