import type { ChecklistDocument } from "@cermont/shared-types";
import type { PipelineStage } from "mongoose";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IChecklistRepository extends IRepository<ChecklistDocument> {
	/** Find one checklist matching the filter as a plain object (for existence checks). */
	findOneLean(filter: Record<string, unknown>): Promise<ChecklistDocument | null>;

	/** Find all checklists matching the filter as plain objects. */
	findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<ChecklistDocument[]>;

	/** Find checklist by ID as a Mongoose document (for save/update operations). */
	findById(id: string): Promise<ChecklistDocument | null>;

	/** Find checklist by ID as a plain object (read-only). */
	findByIdLean(id: string): Promise<ChecklistDocument | null>;

	/** Create and persist a new checklist. Returns a Mongoose document. */
	create(data: Partial<ChecklistDocument>): Promise<ChecklistDocument>;

	/** Execute an aggregation pipeline. Returns aggregated results. */
	aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]>;

	/** Persist changes to an existing checklist document. */
	save(checklist: ChecklistDocument): Promise<ChecklistDocument>;
}
