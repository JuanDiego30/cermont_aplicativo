import type { OrderDocument } from "@cermont/shared-types";
import type { PipelineStage, Types } from "mongoose";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IOrderRepository extends IRepository<OrderDocument<Types.ObjectId>> {
	/** Find order by ID as a Mongoose document (for save/update operations). */
	findById(id: string): Promise<OrderDocument<Types.ObjectId> | null>;

	/** Find order by ID as a plain object (read-only). */
	findByIdLean(id: string): Promise<OrderDocument<Types.ObjectId> | null>;

	/** Find order by ID with all relevant refs populated (assignedTo, createdBy, etc.). */
	findByIdPopulated(id: string): Promise<OrderDocument<Types.ObjectId> | null>;

	/** Find orders matching filter, sorted, with pagination. Returns plain objects. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<OrderDocument<Types.ObjectId>[]>;

	/** Find orders with cursor pagination. Returns one page plus next-page flag. */
	findWithCursor(
		filter: Record<string, unknown>,
		options: {
			limit: number;
			cursor?: string;
			sort?: Record<string, SortDirection>;
		},
	): Promise<{ items: OrderDocument<Types.ObjectId>[]; hasNextPage: boolean }>;

	/** Partial update using MongoDB updateOne. */
	updateOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void>;

	/** Execute an aggregation pipeline. Returns aggregated results. */
	aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]>;

	/** Count documents matching the filter. */
	countDocuments(filter: Record<string, unknown>): Promise<number>;

	/** Persist changes to an existing order document. */
	save(order: OrderDocument<Types.ObjectId>): Promise<OrderDocument<Types.ObjectId>>;
}
