/**
 * IdempotencyEntry Model — Response Cache for Safe Retries
 *
 * Stores the response produced by the first execution of a mutation
 * identified by an Idempotency-Key header. Subsequent requests with
 * the same key, method, and path return the cached response without
 * executing the handler again.
 *
 * Reference: ADR draft — Idempotency for Critical Mutations
 * Pattern: TTL-based with 24-hour expiry (configurable)
 */

import { type Document, model, Schema, type Types } from "mongoose";

export interface IdempotencyEntryDocument extends Document {
	_id: Types.ObjectId;
	key: string;
	method: string;
	path: string;
	userId: string;
	statusCode: number;
	responseBody: string;
	createdAt: Date;
	expiresAt: Date;
}

const IdempotencyEntrySchema = new Schema<IdempotencyEntryDocument>(
	{
		key: {
			type: String,
			required: true,
			maxlength: 128,
			validate: {
				validator: (v: string) => /^[a-zA-Z0-9\-_./@+=]+$/.test(v),
				message: "Idempotency-Key must be URL-safe base64 or UUID",
			},
		},
		method: {
			type: String,
			required: true,
			enum: ["POST", "PATCH", "PUT", "DELETE"],
		},
		path: {
			type: String,
			required: true,
			maxlength: 500,
		},
		userId: {
			type: String,
			required: true,
		},
		statusCode: {
			type: Number,
			required: true,
			min: 100,
			max: 599,
		},
		responseBody: {
			type: String,
			required: true,
		},
		createdAt: { type: Date, default: Date.now },
		expiresAt: {
			type: Date,
			required: true,
			default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
		},
	},
	{ versionKey: false },
);

// Fast lookup by key + method + path
IdempotencyEntrySchema.index({ key: 1, method: 1, path: 1 }, { unique: true });

// TTL cleanup — MongoDB removes expired documents automatically
IdempotencyEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyEntry = model<IdempotencyEntryDocument>(
	"IdempotencyEntry",
	IdempotencyEntrySchema,
);
