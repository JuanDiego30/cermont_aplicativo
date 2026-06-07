import mongoose, { type Document, Schema } from "mongoose";
import { FileAssetRefSchema, type FileAssetRef } from "./sub-schemas/FileAssetRefSchema";

// ═══════════════════════════════════════════════════════════════════════════════
// Resource Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ name: string, required
// ✓ type: enum ['tool', 'vehicle', 'equipment', 'material', 'safety_item',
//               'labor_role', 'certification_requirement', 'spare_part']
// ✓ status: enum ['available', 'in_use', 'maintenance', 'expired', 'inactive']
// ✓ unit: enum measurement unit
// ✓ default_quantity: number (default 1)
// ✓ active: boolean (default true)
// ✓ fileAssets: FileAssetRef[] — image gallery
// ✓ created_by: ObjectId ref to User (optional)
// ✓ updated_by: ObjectId ref to User (optional)
// ✓ timestamps: created_at, updated_at
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_TYPES = [
	"tool",
	"vehicle",
	"equipment",
	"material",
	"safety_item",
	"labor_role",
	"certification_requirement",
	"spare_part",
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_UNITS = [
	"unidad",
	"metro",
	"litro",
	"kilogramo",
	"libra",
	"galon",
	"caja",
	"rollo",
	"par",
	"juego",
	"kit",
] as const;
export type ResourceUnit = (typeof RESOURCE_UNITS)[number];

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
	// New catalog fields
	unit?: ResourceUnit;
	default_quantity: number;
	active: boolean;
	certifications?: Record<string, unknown>[];
	documents?: Record<string, unknown>[];
	evidenceRequirements?: Record<string, unknown>[];
	dynamicForms?: mongoose.Types.ObjectId[];
	fileAssets: FileAssetRef[];
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
		// New catalog fields
		unit: {
			type: String,
			enum: RESOURCE_UNITS,
		},
		default_quantity: {
			type: Number,
			default: 1,
			min: 1,
		},
		active: {
			type: Boolean,
			default: true,
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
		fileAssets: { type: [FileAssetRefSchema], default: [] },
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
ResourceSchema.index({ active: 1 });
ResourceSchema.index({ name: "text" });

const ResourceModel = mongoose.model<IResource>("Resource", ResourceSchema);

export { ResourceModel as Resource };
