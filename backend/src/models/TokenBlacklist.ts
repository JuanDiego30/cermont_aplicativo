/**
 * Token Blacklist Schema — Only Backend
 *
 * Maintains a revocation list of JWT tokens on logout.
 * This schema prevents replayed or revoked tokens from being used.
 *
 * Reference: DOC-04 Section Token Revocation, DOC-09 Section Colecciones Solo-Backend
 */

import { type Document, model, Schema } from "mongoose";

export interface ITokenBlacklist extends Document {
	jti: string; // JWT ID (unique identifier within the token)
	expiresAt: Date; // When to automatically remove from blacklist
	reason: "logout" | "password_change" | "deactivation" | "security";
	createdAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>(
	{
		jti: { type: String, required: true, unique: true, index: true },
		expiresAt: { type: Date, required: true },
		reason: {
			type: String,
			enum: ["logout", "password_change", "deactivation", "security"],
			default: "logout",
		},
	},
	{ timestamps: true, versionKey: false },
);

// Automatically remove documents when expiresAt is reached
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// toJSON: limpiar __v de respuestas
TokenBlacklistSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const TokenBlacklist = model<ITokenBlacklist>("TokenBlacklist", TokenBlacklistSchema);
