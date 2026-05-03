import type { ChecklistDocument } from "@cermont/shared-types";
import type { PipelineStage } from "mongoose";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IChecklistRepository } from "../domain/checklist.repository";
import { Checklist } from "./model";

type ChecklistDocumentWithMethods = ChecklistDocument & {
	save: () => Promise<ChecklistDocument>;
};

function hasSaveMethod(checklist: unknown): checklist is ChecklistDocumentWithMethods {
	return typeof (checklist as { save?: () => Promise<ChecklistDocument> }).save === "function";
}

async function resolveLeanResult<T>(result: T | { lean: () => Promise<T> }): Promise<T> {
	if (
		typeof result === "object" &&
		result !== null &&
		"lean" in result &&
		typeof result.lean === "function"
	) {
		return result.lean();
	}

	return result as T;
}

type SortableLeanQuery<T> = {
	lean: () => Promise<T[]>;
	sort: (sort: Record<string, SortDirection>) => SortableLeanQuery<T>;
};

function isSortableLeanQuery<T>(value: unknown): value is SortableLeanQuery<T> {
	return (
		typeof value === "object" &&
		value !== null &&
		"lean" in value &&
		typeof value.lean === "function" &&
		"sort" in value &&
		typeof value.sort === "function"
	);
}

async function resolveLeanCollection<T>(
	result: T[] | Promise<T[]> | SortableLeanQuery<T>,
	sort?: Record<string, SortDirection>,
): Promise<T[]> {
	if (Array.isArray(result)) {
		return result;
	}

	if (isSortableLeanQuery<T>(result)) {
		return sort ? result.sort(sort).lean() : result.lean();
	}

	if (typeof result === "object" && result !== null && "lean" in result) {
		return (result as { lean: () => Promise<T[]> }).lean();
	}

	return Promise.resolve(result as T[] | Promise<T[]>);
}

export class ChecklistRepository implements IChecklistRepository {
	async findById(id: string): Promise<ChecklistDocument | null> {
		const doc = await Checklist.findById(id);
		return doc as unknown as ChecklistDocument;
	}

	async findByIdLean(id: string): Promise<ChecklistDocument | null> {
		const doc = await Checklist.findById(id).lean();
		return doc as unknown as ChecklistDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<ChecklistDocument | null> {
		const doc = await Checklist.findOne(filter);
		return doc as unknown as ChecklistDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<ChecklistDocument[]> {
		let query = Checklist.find(filter);
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
		return docs as unknown as ChecklistDocument[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		if (typeof Checklist.countDocuments !== "function") {
			const docs = await this.findLean(filter);
			return docs.length;
		}

		return Checklist.countDocuments(filter);
	}

	async create(data: Partial<ChecklistDocument>): Promise<ChecklistDocument> {
		const writeData = data as unknown as Record<string, unknown>;
		const doc =
			typeof Checklist.create === "function"
				? await Checklist.create(writeData)
				: new Checklist(writeData);

		if (hasSaveMethod(doc)) {
			await doc.save();
		}

		return doc as unknown as ChecklistDocument;
	}

	async update(id: string, data: Partial<ChecklistDocument>): Promise<ChecklistDocument | null> {
		const doc = await Checklist.findByIdAndUpdate(id, data as unknown as Record<string, unknown>, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as ChecklistDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Checklist.findByIdAndDelete(id);
		return result !== null;
	}

	async aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]> {
		return Checklist.aggregate(pipeline);
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findOneLean(filter: Record<string, unknown>): Promise<ChecklistDocument | null> {
		const doc = await resolveLeanResult(Checklist.findOne(filter));
		return doc as unknown as ChecklistDocument;
	}

	async findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<ChecklistDocument[]> {
		let query = Checklist.find(filter);
		if (sort) {
			query = query.sort(sort);
		}
		const docs = await resolveLeanCollection(query, sort);
		return docs as unknown as ChecklistDocument[];
	}

	async save(checklist: ChecklistDocument): Promise<ChecklistDocument> {
		if (hasSaveMethod(checklist)) {
			return checklist.save();
		}
		const doc = await Checklist.findById(checklist._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, checklist);
		return doc.save() as unknown as ChecklistDocument;
	}
}
