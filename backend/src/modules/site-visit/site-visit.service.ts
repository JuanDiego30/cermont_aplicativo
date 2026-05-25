import type {
	CompleteSiteVisitRecordInput,
	CreateSiteVisitRecordInput,
	SiteVisitRecord,
	UpdateSiteVisitRecordInput,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { Counter } from "../../models";
import { type SiteVisitDocument, SiteVisitModel } from "../../models/SiteVisit";

function formatCode(sequence: number, year: number): string {
	return `SV-${year}-${String(sequence).padStart(4, "0")}`;
}

async function generateCode(): Promise<string> {
	const now = new Date();
	const year = now.getFullYear();
	const sequence = await Counter.inc(`SV-${year}`);
	return formatCode(sequence, year);
}

function toRecord(doc: SiteVisitDocument): SiteVisitRecord {
	const obj = doc.toJSON() as Record<string, unknown>;

	const toISO = (v: unknown): string | undefined => {
		if (v instanceof Date) {
			return v.toISOString();
		}
		return undefined;
	};

	return {
		_id: String(obj._id),
		code: String(obj.code),
		workRequestId: String(obj.workRequestId),
		serviceCaseId: String(obj.serviceCaseId),
		clientId: String(obj.clientId),
		clientName: String(obj.clientName),
		visitDate: doc.visitDate instanceof Date ? doc.visitDate.toISOString() : String(obj.visitDate),
		location: String(obj.location),
		responsibleUserId: String(obj.responsibleUserId),
		responsibleName: String(obj.responsibleName),
		measurements: Array.isArray(obj.measurements)
			? (obj.measurements as Array<Record<string, unknown>>).map((m) => ({
					label: String(m.label),
					value: String(m.value),
					unit: m.unit ? String(m.unit) : undefined,
				}))
			: [],
		findings: Array.isArray(obj.findings)
			? (obj.findings as Array<Record<string, unknown>>).map((f) => ({
					description: String(f.description),
					severity: String(f.severity) as SiteVisitRecord["findings"][0]["severity"],
					category: String(f.category) as SiteVisitRecord["findings"][0]["category"],
				}))
			: [],
		photos: Array.isArray(obj.photos)
			? (obj.photos as Array<Record<string, unknown>>).map((p) => ({
					url: String(p.url),
					caption: p.caption ? String(p.caption) : undefined,
					takenAt: p.takenAt instanceof Date ? (p.takenAt as Date).toISOString() : undefined,
				}))
			: [],
		requirements: obj.requirements ? String(obj.requirements) : undefined,
		identifiedRisks: obj.identifiedRisks ? String(obj.identifiedRisks) : undefined,
		recommendations: obj.recommendations ? String(obj.recommendations) : undefined,
		observations: obj.observations ? String(obj.observations) : undefined,
		commandHistory: Array.isArray(obj.commandHistory)
			? (obj.commandHistory as Array<Record<string, unknown>>).map((h) => ({
					clientMutationId: String(h.clientMutationId),
					command: String(h.command),
					recordedAt:
						h.recordedAt instanceof Date
							? (h.recordedAt as Date).toISOString()
							: String(h.recordedAt),
				}))
			: [],
		status: String(obj.status) as SiteVisitRecord["status"],
		startedAt: toISO(obj.startedAt),
		completedAt: toISO(obj.completedAt),
		cancelledAt: toISO(obj.cancelledAt),
		cancellationReason: obj.cancellationReason ? String(obj.cancellationReason) : undefined,
		createdBy: String(obj.createdBy),
		createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(obj.createdAt),
		updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(obj.updatedAt),
	} as unknown as SiteVisitRecord;
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
	const filter: Record<string, unknown> = {};
	if (query.workRequestId) {
		filter.workRequestId = query.workRequestId;
	}
	if (query.clientId) {
		filter.clientId = query.clientId;
	}
	if (query.status) {
		filter.status = query.status;
	}

	const [docs, total] = await Promise.all([
		SiteVisitModel.find(filter)
			.sort({ createdAt: -1 })
			.skip((query.page - 1) * query.limit)
			.limit(query.limit),
		SiteVisitModel.countDocuments(filter),
	]);

	return {
		data: await Promise.all(docs.map(toRecord)),
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
