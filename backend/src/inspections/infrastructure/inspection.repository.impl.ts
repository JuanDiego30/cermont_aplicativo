import type { InspectionDocument } from "@cermont/shared-types";
import type { SortOrder } from "mongoose";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IInspectionRepository } from "../domain/inspection.repository";
import { Inspection } from "./model";

type MongooseSort = Record<string, SortOrder>;

function toMongooseSort(sort: Record<string, SortDirection>): MongooseSort {
	return Object.fromEntries(Object.entries(sort).map(([key, value]) => [key, value as SortOrder]));
}

export class InspectionRepository implements IInspectionRepository {
	async findById(id: string): Promise<InspectionDocument | null> {
		const doc = await Inspection.findById(id);
		return doc as unknown as InspectionDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<InspectionDocument | null> {
		const doc = await Inspection.findOne(filter);
		return doc as unknown as InspectionDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<InspectionDocument[]> {
		let query = Inspection.find(filter);
		if (options?.sort) {
			query = query.sort(toMongooseSort(options.sort));
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		const docs = await query;
		return docs as unknown as InspectionDocument[];
	}

	async create(data: Partial<InspectionDocument>): Promise<InspectionDocument> {
		const doc = await Inspection.create(data);
		return doc as unknown as InspectionDocument;
	}

	async findAllPopulated(
		options: { skip?: number; limit?: number; sort?: Record<string, SortDirection> } = {
			sort: { createdAt: -1 },
		},
	): Promise<{ data: InspectionDocument[]; total: number }> {
		const filter = {};
		const [docs, total] = await Promise.all([
			Inspection.find(filter)
				.populate("inspector_id", "name email")
				.populate("approved_by", "name email")
				.sort(toMongooseSort(options.sort ?? { createdAt: -1 }))
				.skip(options.skip ?? 0)
				.limit(options.limit ?? 100)
				.lean(),
			Inspection.countDocuments(filter),
		]);
		return {
			data: docs as unknown as InspectionDocument[],
			total,
		};
	}

	async findByIdPopulated(id: string): Promise<InspectionDocument | null> {
		const doc = await Inspection.findById(id)
			.populate("inspector_id", "name email")
			.populate("approved_by", "name email")
			.lean();
		return doc as unknown as InspectionDocument;
	}

	async findByOrderIdPopulated(
		orderId: string,
		options: { skip?: number; limit?: number; sort?: Record<string, SortDirection> } = {
			sort: { createdAt: -1 },
		},
	): Promise<{ data: InspectionDocument[]; total: number }> {
		const filter = { order_id: orderId };
		const [docs, total] = await Promise.all([
			Inspection.find(filter)
				.populate("inspector_id", "name email")
				.populate("approved_by", "name email")
				.sort(toMongooseSort(options.sort ?? { createdAt: -1 }))
				.skip(options.skip ?? 0)
				.limit(options.limit ?? 100)
				.lean(),
			Inspection.countDocuments(filter),
		]);
		return {
			data: docs as unknown as InspectionDocument[],
			total,
		};
	}

	async findByIdAndUpdate(
		id: string,
		update: Record<string, unknown>,
	): Promise<InspectionDocument | null> {
		const doc = await Inspection.findByIdAndUpdate(id, update, {
			returnDocument: "after",
		}).lean();
		return doc as unknown as InspectionDocument;
	}

	async findByIdAndDelete(id: string): Promise<InspectionDocument | null> {
		const doc = await Inspection.findByIdAndDelete(id).lean();
		return doc as unknown as InspectionDocument;
	}

	async update(id: string, data: Partial<InspectionDocument>): Promise<InspectionDocument | null> {
		const doc = await Inspection.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as InspectionDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Inspection.findByIdAndDelete(id);
		return result !== null;
	}

	async countDocuments(filter: Record<string, unknown> = {}): Promise<number> {
		return Inspection.countDocuments(filter);
	}
}
