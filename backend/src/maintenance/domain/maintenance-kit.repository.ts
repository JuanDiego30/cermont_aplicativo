import type { MaintenanceKitDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IMaintenanceKitRepository extends IRepository<MaintenanceKitDocument> {
	/** Find one kit matching the filter as a plain object (for uniqueness checks). */
	findOneLean(filter: Record<string, unknown>): Promise<MaintenanceKitDocument | null>;

	/** Find kits matching filter with populated created_by, paginated. Returns plain objects. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<MaintenanceKitDocument[]>;

	/** Find kit by ID with populated created_by. Returns plain object. */
	findByIdPopulated(id: string): Promise<MaintenanceKitDocument | null>;

	/** Find kit by ID as a Mongoose document (for save/update operations). */
	findById(id: string): Promise<MaintenanceKitDocument | null>;

	/** Create a new maintenance kit record. */
	create(data: Partial<MaintenanceKitDocument>): Promise<MaintenanceKitDocument>;

	/** Persist changes to an existing kit document. */
	save(kit: MaintenanceKitDocument): Promise<MaintenanceKitDocument>;

	/** Count documents matching the filter. */
	countDocuments(filter: Record<string, unknown>): Promise<number>;
}
