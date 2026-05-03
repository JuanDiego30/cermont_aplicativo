import type { EvidenceDocument } from "@cermont/shared-types";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IEvidenceRepository } from "../domain/evidence.repository";
import { Evidence } from "./model";

type EvidenceDocumentWithMethods = EvidenceDocument & {
	save: () => Promise<EvidenceDocument>;
};

function hasSaveMethod(evidence: unknown): evidence is EvidenceDocumentWithMethods {
	return typeof (evidence as { save?: () => Promise<EvidenceDocument> }).save === "function";
}

export class EvidenceRepository implements IEvidenceRepository {
	async findById(id: string): Promise<EvidenceDocument | null> {
		const doc = await Evidence.findById(id);
		return doc as unknown as EvidenceDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<EvidenceDocument | null> {
		const doc = await Evidence.findOne(filter);
		return doc as unknown as EvidenceDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<EvidenceDocument[]> {
		let query = Evidence.find(filter);
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
		return docs as unknown as EvidenceDocument[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return Evidence.countDocuments(filter);
	}

	async create(data: Partial<EvidenceDocument>): Promise<EvidenceDocument> {
		const doc =
			typeof Evidence.create === "function" ? await Evidence.create(data) : new Evidence(data);

		if (hasSaveMethod(doc)) {
			await doc.save();
		}

		return doc as unknown as EvidenceDocument;
	}

	async update(id: string, data: Partial<EvidenceDocument>): Promise<EvidenceDocument | null> {
		const doc = await Evidence.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as EvidenceDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Evidence.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findOneLean(filter: Record<string, unknown>): Promise<EvidenceDocument | null> {
		const doc = await Evidence.findOne(filter).lean();
		return doc as unknown as EvidenceDocument;
	}

	async findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<EvidenceDocument[]> {
		let query = Evidence.find(filter);
		if (sort) {
			query = query.sort(sort);
		}
		const docs = await query.lean();
		return docs as unknown as EvidenceDocument[];
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<EvidenceDocument[]> {
		let query = Evidence.find(filter);
		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.skip(options.skip).limit(options.limit);
		const docs = await query.lean();
		return docs as unknown as EvidenceDocument[];
	}

	async save(evidence: EvidenceDocument): Promise<EvidenceDocument> {
		if (hasSaveMethod(evidence)) {
			return evidence.save();
		}
		const doc = await Evidence.findById(evidence._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, evidence);
		return doc.save() as unknown as EvidenceDocument;
	}
}
