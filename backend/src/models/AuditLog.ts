/**
 * AuditLog Schema — Only Backend
 *
 * Tracks all system actions for compliance and debugging.
 * This schema is NOT shared with frontend (sensitive logging data).
 *
 * Reference: DOC-09 Section Colecciones Solo-Backend
 */

import { type Document, model, Schema, type Types } from "mongoose";

export interface IAuditLog extends Document {
	entityType: string; // 'Order', 'User', 'Proposal', etc.
	entityId: Types.ObjectId;
	action: string; // e.g. 'ORDER_CREATED', 'STATUS_CHANGED', 'LOGIN', 'LOGOUT', etc.
	userId: Types.ObjectId;
	userEmail: string;
	changes: {
		before?: Record<string, unknown>;
		after?: Record<string, unknown>;
	};
	metadata?: unknown;
	ipAddress?: string;
	userAgent?: string;
	status: "success" | "failure";
	errorMessage?: string;
	createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
	{
		entityType: { type: String, required: true, index: true },
		entityId: { type: Schema.Types.ObjectId, required: true, index: true },
		action: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		userEmail: { type: String, required: true },
		changes: {
			before: { type: Schema.Types.Mixed },
			after: { type: Schema.Types.Mixed },
		},
		metadata: { type: Schema.Types.Mixed },
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
AuditLogSchema.index({ createdAt: -1 });

// Auto-delete after 1 year (per DOC-09 §7 - TTL: 1 año)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// toJSON: limpiar __v de respuestas
AuditLogSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
