/**
 * Audit Log Repository Implementation — Audit Domain
 *
 * Mongoose-backed implementation of IAuditLogRepository.
 * Wraps all AuditLog model operations. No business logic.
 */

import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IAuditLogRepository } from "../domain/audit-log.repository";
import type { IAuditLog } from "./model";
import { AuditLog } from "./model";

export class AuditLogRepository implements IAuditLogRepository {
	async findById(id: string): Promise<IAuditLog | null> {
		return AuditLog.findById(id);
	}

	async findOne(filter: Record<string, unknown>): Promise<IAuditLog | null> {
		return AuditLog.findOne(filter);
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<IAuditLog[]> {
		let query = AuditLog.find(filter);
		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		return query;
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return AuditLog.countDocuments(filter);
	}

	async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
		return AuditLog.create(data);
	}

	async update(id: string, data: Partial<IAuditLog>): Promise<IAuditLog | null> {
		return AuditLog.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
	}

	async delete(id: string): Promise<boolean> {
		const result = await AuditLog.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<IAuditLog[]> {
		let query = AuditLog.find(filter);
		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.skip(options.skip).limit(options.limit);
		return query.lean();
	}

	async findByIdLean(id: string): Promise<IAuditLog | null> {
		return AuditLog.findById(id).lean();
	}
}
