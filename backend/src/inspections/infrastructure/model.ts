import { type Document, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// Inspection Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ order_id: ObjectId ref to Order
// ✓ inspection_type: enum ['grinder', 'harness', 'electrical', 'extinguisher', 'vehicle', 'generic']
// ✓ status: enum ['pending', 'approved', 'rejected', 'conditional']
// ✓ inspector_id: ObjectId ref to User
// ✓ inspection_date: date, required
// ✓ items: [{code, description, passed, notes, evidence_url}]
// ✓ photos: [string]
// ✓ observations: string (optional)
// ✓ next_inspection_date: date (optional)
// ✓ approved_by: ObjectId ref to User
// ✓ approved_at: date
// ✓ created_by: ObjectId ref to User
// ✓ timestamps: createdAt, updatedAt
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────────────────

export type InspectionType =
	| "grinder" // Inspección de pulidoras/esmeriladoras
	| "harness" // Inspección de arnés de seguridad
	| "electrical" // Inspección de equipos eléctricos
	| "extinguisher" // Inspección de extintores
	| "vehicle" // Inspección de vehículos
	| "generic"; // Inspección genérica

export type InspectionStatus = "pending" | "approved" | "rejected" | "conditional";

export interface IInspectionItem {
	code: string; // e.g. "PUL-01", "ARN-03"
	description: string;
	passed: boolean;
	notes?: string;
	evidence_url?: string;
}

export interface IInspection extends Document {
	order_id: Types.ObjectId;
	inspection_type: InspectionType;
	status: InspectionStatus;
	inspector_id: Types.ObjectId;
	inspection_date: Date;
	items: IInspectionItem[];
	photos: string[];
	observations?: string;
	next_inspection_date?: Date;
	approved_by?: Types.ObjectId;
	approved_at?: Date;
	created_by: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const inspectionItemSchema = new Schema<IInspectionItem>(
	{
		code: { type: String, required: true, trim: true },
		description: { type: String, required: true, trim: true },
		passed: { type: Boolean, required: true, default: false },
		notes: { type: String, trim: true },
		evidence_url: { type: String, trim: true },
	},
	{ _id: false },
);

// ── Main schema ──────────────────────────────────────────────────────────────

const inspectionSchema = new Schema<IInspection>(
	{
		order_id: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			index: true,
		},
		inspection_type: {
			type: String,
			enum: ["grinder", "harness", "electrical", "extinguisher", "vehicle", "generic"],
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "conditional"],
			required: true,
			default: "pending",
			index: true,
		},
		inspector_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		inspection_date: {
			type: Date,
			required: true,
			default: Date.now,
		},
		items: {
			type: [inspectionItemSchema],
			required: true,
			validate: {
				validator: (v: IInspectionItem[]) => v.length > 0,
				message: "Inspection must have at least one item",
			},
		},
		photos: {
			type: [String],
			default: [],
		},
		observations: { type: String, trim: true },
		next_inspection_date: { type: Date },
		approved_by: { type: Schema.Types.ObjectId, ref: "User" },
		approved_at: { type: Date },
		created_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform(_doc, ret) {
				const json = ret as Record<string, unknown>;
				delete json.__v;
				return ret;
			},
		},
	},
);

// Compound index for common query pattern
inspectionSchema.index({ order_id: 1, inspection_type: 1 });

export const Inspection = model<IInspection>("Inspection", inspectionSchema);
