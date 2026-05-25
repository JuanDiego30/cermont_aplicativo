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
// ✓ purchase_date: date (optional)
// ✓ maintenance_date: date (optional)
// ✓ created_by: ObjectId ref to User (optional)
// ✓ updated_by: ObjectId ref to User (optional)
// ✓ timestamps: created_at, updated_at
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_TYPES = ["tool", "vehicle", "equipment"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_STATUSES = [
	"available",
	"in_use",
	"maintenance",
	"expired",
	"inactive",
] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface IResource extends Document {
	name: string;
	type: ResourceType;
	status: ResourceStatus;
	description?: string;
	serial_number?: string;
	brand?: string;
	modelName?: string;
	purchase_date?: Date;
	maintenance_date?: Date;
	category?: string;
	certifications?: Record<string, unknown>[];
	documents?: Record<string, unknown>[];
	evidenceRequirements?: Record<string, unknown>[];
	dynamicForms?: mongoose.Types.ObjectId[];
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
		brand: {
			type: String,
			trim: true,
		},
		modelName: {
			type: String,
			trim: true,
		},
		purchase_date: {
			type: Date,
		},
		maintenance_date: {
			type: Date,
		},
		category: {
			type: String,
			trim: true,
		},
		certifications: {
			type: Schema.Types.Mixed,
			default: [],
		},
		documents: {
			type: Schema.Types.Mixed,
			default: [],
		},
		evidenceRequirements: {
			type: Schema.Types.Mixed,
			default: [],
		},
		dynamicForms: [
			{
				type: Schema.Types.ObjectId,
				ref: "DocumentTemplate",
			},
		],
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
ResourceSchema.index({ name: "text" });

const ResourceModel = mongoose.model<IResource>("Resource", ResourceSchema);

export { ResourceModel as Resource };
