import type { MaintenanceKitDocument } from "@cermont/shared-types";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IMaintenanceKitRepository } from "../domain/maintenance-kit.repository";
import { MaintenanceKit } from "./model";

const POPULATE_CREATED_BY = { path: "created_by", select: "name email" };

type MaintenanceKitDocumentWithMethods = MaintenanceKitDocument & {
	save: () => Promise<MaintenanceKitDocument>;
};

function hasSaveMethod(kit: MaintenanceKitDocument): kit is MaintenanceKitDocumentWithMethods {
	return typeof (kit as { save?: () => Promise<MaintenanceKitDocument> }).save === "function";
}

export class MaintenanceKitRepository implements IMaintenanceKitRepository {
	async findById(id: string): Promise<MaintenanceKitDocument | null> {
		const doc = await MaintenanceKit.findById(id);
		return doc as unknown as MaintenanceKitDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<MaintenanceKitDocument | null> {
		const doc = await MaintenanceKit.findOne(filter);
		return doc as unknown as MaintenanceKitDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<MaintenanceKitDocument[]> {
		let query = MaintenanceKit.find(filter);
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
		return docs as unknown as MaintenanceKitDocument[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return MaintenanceKit.countDocuments(filter);
	}

	async create(data: Partial<MaintenanceKitDocument>): Promise<MaintenanceKitDocument> {
		const doc = await MaintenanceKit.create(data);
		return doc as unknown as MaintenanceKitDocument;
	}

	async update(
		id: string,
		data: Partial<MaintenanceKitDocument>,
	): Promise<MaintenanceKitDocument | null> {
		const doc = await MaintenanceKit.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as MaintenanceKitDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await MaintenanceKit.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findOneLean(filter: Record<string, unknown>): Promise<MaintenanceKitDocument | null> {
		const doc = await MaintenanceKit.findOne(filter).lean();
		return doc as unknown as MaintenanceKitDocument;
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<MaintenanceKitDocument[]> {
		let query = MaintenanceKit.find(filter).populate(POPULATE_CREATED_BY);
		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.limit(options.limit).skip(options.skip);
		const docs = await query.lean();
		return docs as unknown as MaintenanceKitDocument[];
	}

	async findByIdPopulated(id: string): Promise<MaintenanceKitDocument | null> {
		const doc = await MaintenanceKit.findById(id).populate(POPULATE_CREATED_BY).lean();
		return doc as unknown as MaintenanceKitDocument;
	}

	async save(kit: MaintenanceKitDocument): Promise<MaintenanceKitDocument> {
		if (hasSaveMethod(kit)) {
			await kit.save();
			return kit;
		}
		const doc = await MaintenanceKit.findById(kit._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, kit);
		await doc.save();
		return doc as unknown as MaintenanceKitDocument;
	}
}
