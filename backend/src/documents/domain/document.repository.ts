import type { DocumentDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IDocumentRepository extends IRepository<DocumentDocument> {
	/** Find documents matching filter, sorted and returned as plain objects. */
	findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<DocumentDocument[]>;

	/** Find document by ID as a plain object (for read and file cleanup). */
	findByIdLean(id: string): Promise<DocumentDocument | null>;

	/** Create a new document record. */
	create(data: Partial<DocumentDocument>): Promise<DocumentDocument>;

	/** Update a document by ID and return the updated plain object. */
	findByIdAndUpdate(id: string, update: Record<string, unknown>): Promise<DocumentDocument | null>;

	/** Hard delete a document by ID. */
	findByIdAndDelete(id: string): Promise<DocumentDocument | null>;
}
