/**
 * AuditLog Schema — Only Backend
 *
 * Tracks all system actions for compliance and debugging.
 * This schema is NOT shared with frontend (sensitive logging data).
 *
 * Reference: DOC-09 Section Colecciones Solo-Backend
 */

import type { AuditAction } from "@cermont/shared-types";
import { type Document, model, Schema, type Types } from "mongoose";
import { type JsonPrimitive, removeVersionKey } from "../common/types/safe-types";

type AuditStoredValue = JsonPrimitive | object;

export interface IAuditLog extends Document {
	entityType: string; // 'Order', 'User', 'Proposal', etc.
	entityId: string;
	action: AuditAction;
	userId: Types.ObjectId;
	userEmail: string;
	changes: {
		before?: AuditStoredValue;
		after?: AuditStoredValue;
	};
	metadata?: AuditStoredValue;
	requestId?: string;
	ipAddress?: string;
	userAgent?: string;
	status: "success" | "failure";
	errorMessage?: string;
	createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
	{
		entityType: { type: String, required: true, index: true },
		entityId: {
			type: String,
			required: true,
			index: true,
			trim: true,
			maxlength: 128,
			match: /^[A-Za-z0-9][A-Za-z0-9._:-]*$/,
		},
		action: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		userEmail: { type: String, required: true },
		changes: {
			before: { type: Schema.Types.Mixed },
			after: { type: Schema.Types.Mixed },
		},
		metadata: { type: Schema.Types.Mixed },
		requestId: { type: String, maxlength: 128 },
		ipAddress: String,
		userAgent: String,
		status: { type: String, enum: ["success", "failure"], default: "success" },
		errorMessage: String,
	},
	{ timestamps: true, versionKey: false },
);

// Index for querying audit trail by entity
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ requestId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

const immutableAuditError = (): Error =>
	new Error("AUDIT_LOG_IMMUTABLE: audit records cannot be updated or deleted");

AuditLogSchema.pre("save", function preventAuditDocumentUpdate() {
	if (!this.isNew) {
		throw immutableAuditError();
	}
});
AuditLogSchema.pre("updateOne", function preventAuditUpdateOne() {
	throw immutableAuditError();
});
AuditLogSchema.pre("updateMany", function preventAuditUpdateMany() {
	throw immutableAuditError();
});
AuditLogSchema.pre("findOneAndUpdate", function preventAuditFindOneAndUpdate() {
	throw immutableAuditError();
});
AuditLogSchema.pre("replaceOne", function preventAuditReplaceOne() {
	throw immutableAuditError();
});
AuditLogSchema.pre("deleteOne", function preventAuditDeleteOne() {
	throw immutableAuditError();
});
AuditLogSchema.pre("deleteMany", function preventAuditDeleteMany() {
	throw immutableAuditError();
});
AuditLogSchema.pre("findOneAndDelete", function preventAuditFindOneAndDelete() {
	throw immutableAuditError();
});

// toJSON: limpiar __v de respuestas
AuditLogSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return removeVersionKey(ret);
	},
});

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);

/**
 * Production disables Mongoose auto-indexing, so reconcile the forensic
 * indexes explicitly and remove the legacy one-year TTL index if present.
 */
export async function ensureAuditLogIndexes(): Promise<void> {
	await AuditLog.createCollection();
	await AuditLog.collection.updateMany({ entityId: { $type: "objectId" } }, [
		{ $set: { entityId: { $toString: "$entityId" } } },
	]);
	const indexes = await AuditLog.collection.indexes();
	const legacyTtlIndex = indexes.find(
		(index) => index.key.createdAt === 1 && typeof index.expireAfterSeconds === "number",
	);

	if (legacyTtlIndex?.name) {
		try {
			await AuditLog.collection.dropIndex(legacyTtlIndex.name);
		} catch (error) {
			if (!(error instanceof Error) || !/index not found/i.test(error.message)) {
				throw error;
			}
		}
	}

	await AuditLog.createIndexes();
}
