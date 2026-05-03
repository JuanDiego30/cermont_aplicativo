/**
 * Audit Log Repository Interface — Audit Domain
 *
 * Abstraction over AuditLog Mongoose model.
 * Services depend on this interface, never on the model directly.
 *
 * Note: The audit service also looks up User emails (User.findById).
 * That cross-domain read is handled via IUserRepository injection,
 * not through this interface.
 */

import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";
import type { IAuditLog } from "../infrastructure/model";

export interface IAuditLogRepository extends IRepository<IAuditLog> {
	/** Create an audit log entry. Fire-and-forget in practice. */
	create(data: Partial<IAuditLog>): Promise<IAuditLog>;

	/** Paginated audit log listing with filters, sorted. Returns plain objects. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<IAuditLog[]>;

	/** Find audit log by ID as a plain object. */
	findByIdLean(id: string): Promise<IAuditLog | null>;
}
