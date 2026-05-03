import type { WorkReportDocument } from "@cermont/shared-types";
import type { WorkReportStatus } from "../infrastructure/model";

export interface IWorkReportRepository {
	findByOrderIdAndStatus(
		orderId: string,
		status: WorkReportStatus,
	): Promise<WorkReportDocument | null>;
	findByOrderIdLean(orderId: string): Promise<WorkReportDocument | null>;
	findById(id: string): Promise<WorkReportDocument | null>;
	findByIdLean(id: string): Promise<WorkReportDocument | null>;
	findOneLean(filter: Record<string, unknown>): Promise<WorkReportDocument | null>;
	findAll(
		filter: Record<string, unknown>,
		page?: number,
		limit?: number,
	): Promise<{ data: WorkReportDocument[]; total: number }>;
	create(data: Partial<WorkReportDocument>): Promise<WorkReportDocument>;
	save(report: WorkReportDocument): Promise<WorkReportDocument>;
	countDocuments(filter: Record<string, unknown>): Promise<number>;
}
