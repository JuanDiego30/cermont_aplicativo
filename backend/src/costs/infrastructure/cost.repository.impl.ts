import type { CostDocument } from "@cermont/shared-types";
import type { PipelineStage } from "mongoose";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { ICostRepository } from "../domain/cost.repository";
import { Cost } from "./model";

type CostDocumentWithMethods = CostDocument & {
	save: () => Promise<CostDocument>;
};

function hasSaveMethod(cost: unknown): cost is CostDocumentWithMethods {
	return typeof (cost as { save?: unknown }).save === "function";
}

export class CostRepository implements ICostRepository {
	async findById(id: string): Promise<CostDocument | null> {
		const doc = await Cost.findById(id);
		return doc as unknown as CostDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<CostDocument | null> {
		const doc = await Cost.findOne(filter);
		return doc as unknown as CostDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<CostDocument[]> {
		let query = Cost.find(filter);
		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		const docs = await query;
		return docs as unknown as CostDocument[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return Cost.countDocuments(filter);
	}

	async create(data: Partial<CostDocument>): Promise<CostDocument> {
		const doc = typeof Cost.create === "function" ? await Cost.create(data) : new Cost(data);

		if (hasSaveMethod(doc)) {
			await doc.save();
		}

		return doc as unknown as CostDocument;
	}

	async update(id: string, data: Partial<CostDocument>): Promise<CostDocument | null> {
		const doc = await Cost.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as CostDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Cost.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<CostDocument[]> {
		let query = Cost.find(filter);
		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.skip(options.skip).limit(options.limit);
		const docs = await query.lean();
		return docs as unknown as CostDocument[];
	}

	async findByIdLean(id: string): Promise<CostDocument | null> {
		const doc = await Cost.findById(id).lean();
		return doc as unknown as CostDocument;
	}

	async findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<CostDocument[]> {
		let query = Cost.find(filter);
		if (sort) {
			query = query.sort(sort);
		}
		const docs = await query.lean();
		return docs as unknown as CostDocument[];
	}

	async aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]> {
		return Cost.aggregate(pipeline);
	}

	async deleteOne(filter: Record<string, unknown>): Promise<boolean> {
		const result = await Cost.deleteOne(filter);
		return result.deletedCount > 0;
	}

	async save(cost: CostDocument): Promise<CostDocument> {
		if (hasSaveMethod(cost)) {
			return cost.save();
		}
		const doc = await Cost.findById(cost._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, cost);
		return doc.save() as unknown as CostDocument;
	}
}
