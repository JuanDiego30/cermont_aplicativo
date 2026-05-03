import type { ProposalDocument } from "@cermont/shared-types";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IProposalRepository } from "../domain/proposal.repository";
import { Proposal } from "./model";

const POPULATE_CREATED_BY_ARGS = ["createdBy", "name email"] as const;
const POPULATE_APPROVED_BY_ARGS = ["approvedBy", "name email"] as const;
const POPULATE_ORDERS_ARGS = ["generatedOrders"] as const;

type ProposalDocumentWithMethods = ProposalDocument & {
	save: () => Promise<ProposalDocument>;
	populate: (paths: string[]) => Promise<ProposalDocument>;
};

function hasSaveMethod(proposal: ProposalDocument): proposal is ProposalDocumentWithMethods {
	return typeof (proposal as { save?: () => Promise<ProposalDocument> }).save === "function";
}
export class ProposalRepository implements IProposalRepository {
	async findById(id: string): Promise<ProposalDocument | null> {
		const doc = await Proposal.findById(id);
		return doc as unknown as ProposalDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<ProposalDocument | null> {
		const doc = await Proposal.findOne(filter);
		return doc as unknown as ProposalDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<ProposalDocument[]> {
		let query = Proposal.find(filter);
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
		return docs as unknown as ProposalDocument[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return Proposal.countDocuments(filter);
	}

	async create(data: Partial<ProposalDocument>): Promise<ProposalDocument> {
		const doc =
			typeof Proposal.create === "function" ? await Proposal.create(data) : new Proposal(data);
		return doc as unknown as ProposalDocument;
	}

	async update(id: string, data: Partial<ProposalDocument>): Promise<ProposalDocument | null> {
		const doc = await Proposal.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as ProposalDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Proposal.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findByIdPopulated(id: string): Promise<ProposalDocument | null> {
		const doc = await Proposal.findById(id)
			.populate(...POPULATE_CREATED_BY_ARGS)
			.populate(...POPULATE_APPROVED_BY_ARGS)
			.populate(...POPULATE_ORDERS_ARGS)
			.lean();
		return doc as unknown as ProposalDocument;
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
			populate?: string[];
		},
	): Promise<ProposalDocument[]> {
		let query = Proposal.find(filter);

		if (options.populate) {
			for (const path of options.populate) {
				if (path === "createdBy") {
					query = query.populate(...POPULATE_CREATED_BY_ARGS);
				} else if (path === "approvedBy") {
					query = query.populate(...POPULATE_APPROVED_BY_ARGS);
				} else {
					query = query.populate(path);
				}
			}
		}

		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.skip(options.skip).limit(options.limit);
		const docs = await query.lean();
		return docs as unknown as ProposalDocument[];
	}

	async saveAndPopulate(proposal: ProposalDocument, paths: string[]): Promise<ProposalDocument> {
		// If it's a Mongoose document, it will have .save()
		if (hasSaveMethod(proposal)) {
			await proposal.save();
			await proposal.populate(paths);
			return proposal;
		}

		// If it's a plain object, we find and update
		const doc = await Proposal.findById(proposal._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, proposal);
		await doc.save();
		await doc.populate(paths);
		return doc as unknown as ProposalDocument;
	}

	async save(proposal: ProposalDocument): Promise<ProposalDocument> {
		if (hasSaveMethod(proposal)) {
			await proposal.save();
			return proposal;
		}

		const doc = await Proposal.findById(proposal._id);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, proposal);
		await doc.save();
		return doc as unknown as ProposalDocument;
	}

	async findOneLean(filter: Record<string, unknown>): Promise<ProposalDocument | null> {
		const doc = await Proposal.findOne(filter).lean();
		return doc as unknown as ProposalDocument;
	}
}
