import type { EvidenceDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IEvidenceRepository extends IRepository<EvidenceDocument> {
	/** Find one evidence matching the filter as a plain object (for existence/idempotency checks). */
	findOneLean(filter: Record<string, unknown>): Promise<EvidenceDocument | null>;

	/** Find all evidences matching the filter as plain objects. */
	findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<EvidenceDocument[]>;

	/** Find all evidences matching the filter as plain objects, with optional pagination. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<EvidenceDocument[]>;

	/** Find evidence by ID as a Mongoose document (for save/soft-delete operations). */
	findById(id: string): Promise<EvidenceDocument | null>;

	/** Create and persist a new evidence entry. Returns a Mongoose document. */
	create(data: Partial<EvidenceDocument>): Promise<EvidenceDocument>;

	/** Persist changes to an existing evidence document. */
	save(evidence: EvidenceDocument): Promise<EvidenceDocument>;

	/** Count documents matching the filter. */
	countDocuments(filter: Record<string, unknown>): Promise<number>;
}
