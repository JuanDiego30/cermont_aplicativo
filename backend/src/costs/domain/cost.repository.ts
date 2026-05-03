import type { CostDocument } from "@cermont/shared-types";
import type { PipelineStage } from "mongoose";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface ICostRepository extends IRepository<CostDocument> {
	/** Paginated cost listing with filters. Returns plain objects. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<CostDocument[]>;

	/** Find cost by ID as a Mongoose document (for save/update operations). */
	findById(id: string): Promise<CostDocument | null>;

	/** Find cost by ID as a plain object (read-only). */
	findByIdLean(id: string): Promise<CostDocument | null>;

	/** Find all costs matching the filter as plain objects. */
	findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<CostDocument[]>;

	/** Execute an aggregation pipeline. Returns aggregated results. */
	aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]>;

	/** Hard delete a cost document matching the filter. */
	deleteOne(filter: Record<string, unknown>): Promise<boolean>;

	/** Create and persist a new cost entry. Returns a Mongoose document. */
	create(data: Partial<CostDocument>): Promise<CostDocument>;

	/** Persist changes to an existing cost document. */
	save(cost: CostDocument): Promise<CostDocument>;
}
