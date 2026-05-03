import type { ProposalDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IProposalRepository extends IRepository<ProposalDocument> {
	/** Find proposal by ID as a Mongoose document (for save/update operations). */
	findById(id: string): Promise<ProposalDocument | null>;

	/** Find proposal by ID with populated refs (createdBy, approvedBy, generatedOrders). Returns plain object. */
	findByIdPopulated(id: string): Promise<ProposalDocument | null>;

	/** Find proposals matching filter with populated refs, sorted, with pagination. Returns plain objects. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
			populate?: string[];
		},
	): Promise<ProposalDocument[]>;

	/** Create and persist a new proposal. Returns a Mongoose document. */
	create(data: Partial<ProposalDocument>): Promise<ProposalDocument>;

	/** Persist changes to a proposal. */
	save(proposal: ProposalDocument): Promise<ProposalDocument>;

	/** Persist changes and populate specified paths. */
	saveAndPopulate(proposal: ProposalDocument, paths: string[]): Promise<ProposalDocument>;

	/** Count documents matching the filter. */
	countDocuments(filter: Record<string, unknown>): Promise<number>;

	/** Find one document matching the filter and return as plain object. */
	findOneLean(filter: Record<string, unknown>): Promise<ProposalDocument | null>;
}
