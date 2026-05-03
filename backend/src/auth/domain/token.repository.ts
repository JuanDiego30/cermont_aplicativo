/**
 * Token Blacklist Repository Interface — Auth Domain
 *
 * Abstraction over TokenBlacklist Mongoose model.
 * Used for JWT revocation (logout, password change, deactivation).
 */

import type { ITokenBlacklist } from "../infrastructure/token-blacklist.model";

export interface ITokenRepository {
	/** Check if a token (by jti) is blacklisted. Returns plain object. */
	findByJti(jti: string): Promise<ITokenBlacklist | null>;

	/** Blacklist a token by creating a revocation record. */
	create(data: Partial<ITokenBlacklist>): Promise<ITokenBlacklist>;
}
