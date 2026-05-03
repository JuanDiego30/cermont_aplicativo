import type { WorkReportDocument } from "@cermont/shared-types";
import type { IWorkReportRepository } from "../domain/work-report.repository";
import { WorkReport } from "./model";

type WorkReportDocumentWithMethods = WorkReportDocument & {
	save: () => Promise<WorkReportDocument>;
};

function hasSaveMethod(report: unknown): report is WorkReportDocumentWithMethods {
	return typeof (report as { save?: unknown }).save === "function";
}

export class WorkReportRepository implements IWorkReportRepository {
	async findByOrderIdAndStatus(
		orderId: string,
		status: string,
	): Promise<WorkReportDocument | null> {
		const doc = await WorkReport.findOne({ orderId, status }).lean();
		return doc as unknown as WorkReportDocument;
	}

	async findByOrderIdLean(orderId: string): Promise<WorkReportDocument | null> {
		const doc = await WorkReport.findOne({ orderId }).lean();
		return doc as unknown as WorkReportDocument;
	}

	async findById(id: string): Promise<WorkReportDocument | null> {
		const doc = await WorkReport.findById(id);
		return doc as unknown as WorkReportDocument;
	}

	async findByIdLean(id: string): Promise<WorkReportDocument | null> {
		const doc = await WorkReport.findById(id).lean();
		return doc as unknown as WorkReportDocument;
	}

	async findOneLean(filter: Record<string, unknown>): Promise<WorkReportDocument | null> {
		const doc = await WorkReport.findOne(filter).lean();
		return doc as unknown as WorkReportDocument;
	}

	async findAll(
		filter: Record<string, unknown>,
		page: number = 1,
		limit: number = 20,
	): Promise<{ data: WorkReportDocument[]; total: number }> {
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			WorkReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			WorkReport.countDocuments(filter),
		]);
		return { data: data as unknown as WorkReportDocument[], total };
	}

	async create(data: Partial<WorkReportDocument>): Promise<WorkReportDocument> {
		const doc =
			typeof WorkReport.create === "function"
				? await WorkReport.create(data)
				: new WorkReport(data);

		if (hasSaveMethod(doc)) {
			await doc.save();
		}

		return doc as unknown as WorkReportDocument;
	}

	async save(report: WorkReportDocument): Promise<WorkReportDocument> {
		// If it's a Mongoose document, it will have .save()
		if (typeof (report as { save?: unknown }).save === "function") {
			return (report as WorkReportDocument & { save(): Promise<WorkReportDocument> }).save();
		}
		// If it's a plain object, we find and update
		const doc = await WorkReport.findById(
			(report as { _id: { toString(): string } })._id.toString(),
		);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, report);
		return doc.save() as unknown as WorkReportDocument;
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return WorkReport.countDocuments(filter);
	}
}
