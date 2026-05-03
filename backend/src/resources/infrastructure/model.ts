import mongoose, { type Document, Schema } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// Resource Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ name: string, required
// ✓ type: enum ['tool', 'vehicle', 'equipment']
// ✓ status: enum ['available', 'in_use', 'maintenance']
// ✓ description: string (optional)
// ✓ serial_number: string (optional)
// ✓ purchaseDate: date (optional)
// ✓ maintenanceDate: date (optional)
// ✓ created_by: ObjectId ref to User (optional)
// ✓ updated_by: ObjectId ref to User (optional)
// ✓ timestamps: created_at, updated_at
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_TYPES = ["tool", "vehicle", "equipment"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_STATUSES = ["available", "in_use", "maintenance"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface IResource extends Document {
	name: string;
	type: ResourceType;
	status: ResourceStatus;
	description?: string;
	serial_number?: string;
	purchaseDate?: Date;
	maintenanceDate?: Date;
	created_at: Date;
	updated_at: Date;
	created_by?: mongoose.Types.ObjectId;
	updated_by?: mongoose.Types.ObjectId;
}

const ResourceSchema = new Schema<IResource>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		type: {
			type: String,
			enum: RESOURCE_TYPES,
			required: true,
		},
		status: {
			type: String,
			enum: RESOURCE_STATUSES,
			default: "available",
		},
		description: {
			type: String,
			trim: true,
		},
		serial_number: {
			type: String,
			trim: true,
		},
		purchaseDate: {
			type: Date,
		},
		maintenanceDate: {
			type: Date,
		},
		created_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		updated_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		toJSON: {
			transform(_doc, ret) {
				const json = ret as Record<string, unknown>;
				delete json.__v;
				return ret;
			},
		},
	},
);

// Indexes
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ type: 1, status: 1, created_at: -1 });
ResourceSchema.index({ name: "text" });

const ResourceModel = mongoose.model<IResource>("Resource", ResourceSchema);

export { ResourceModel as Resource };
