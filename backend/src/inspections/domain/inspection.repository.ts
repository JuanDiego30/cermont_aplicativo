import type { InspectionDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IInspectionRepository extends IRepository<InspectionDocument> {
	/** Create a new inspection record. */
	create(data: Partial<InspectionDocument>): Promise<InspectionDocument>;

	/** Find all inspections with populated refs (inspector_id, approved_by), sorted. Returns plain objects with total count. */
	findAllPopulated(options?: {
		skip?: number;
		limit?: number;
		sort?: Record<string, SortDirection>;
	}): Promise<{ data: InspectionDocument[]; total: number }>;

	/** Find inspection by ID with populated refs. Returns plain object. */
	findByIdPopulated(id: string): Promise<InspectionDocument | null>;

	/** Find inspections by order ID with populated refs, sorted. Returns plain objects with total count. */
	findByOrderIdPopulated(
		orderId: string,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<{ data: InspectionDocument[]; total: number }>;

	/** Update inspection by ID and return the updated plain object. */
	findByIdAndUpdate(
		id: string,
		update: Record<string, unknown>,
	): Promise<InspectionDocument | null>;

	/** Delete an inspection by ID. Returns the deleted document or null. */
	findByIdAndDelete(id: string): Promise<InspectionDocument | null>;
}
