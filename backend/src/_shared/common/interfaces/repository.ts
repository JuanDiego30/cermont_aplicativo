/**
 * Base Repository Interface — Generic CRUD contract for all domain repositories.
 *
 * Every domain repository extends this interface with domain-specific methods.
 * Services depend on these interfaces, never on Mongoose models directly.
 * Enforces Low Coupling / High Cohesion (SOLID — DIP).
 */

export type SortDirection = 1 | -1 | "asc" | "desc" | "ascending" | "descending";

export interface FindOptions {
	skip?: number;
	limit?: number;
	sort?: Record<string, SortDirection>;
}

export interface IRepository<T> {
	findById(id: string): Promise<T | null>;
	findOne(filter: Record<string, unknown>): Promise<T | null>;
	find(filter: Record<string, unknown>, options?: FindOptions): Promise<T[]>;
	countDocuments(filter: Record<string, unknown>): Promise<number>;
	create(data: Partial<T>): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T | null>;
	delete(id: string): Promise<boolean>;
}
