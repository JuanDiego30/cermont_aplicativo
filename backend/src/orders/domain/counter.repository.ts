/**
 * Counter Repository Interface — Orders Domain
 *
 * Abstraction over Counter Mongoose model (atomic sequence generator).
 * Used for generating unique order codes (OT-YYYYMM-NNNN) and proposal codes.
 */

export interface ICounterRepository {
	/** Atomically increment and return the next sequence value for a given key. */
	inc(key: string): Promise<number>;
}
