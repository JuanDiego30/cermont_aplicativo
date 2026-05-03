/**
 * Token Blacklist Repository Implementation — Auth Domain
 *
 * Mongoose-backed implementation of ITokenRepository.
 * Wraps all TokenBlacklist model operations. No business logic.
 */

import type { ITokenRepository } from "../domain/token.repository";
import { TokenBlacklist } from "./model";
import type { ITokenBlacklist } from "./token-blacklist.model";

export class TokenRepository implements ITokenRepository {
	async findByJti(jti: string): Promise<ITokenBlacklist | null> {
		return TokenBlacklist.findOne({ jti }).lean();
	}

	async create(data: Partial<ITokenBlacklist>): Promise<ITokenBlacklist> {
		return TokenBlacklist.create(data);
	}
}
