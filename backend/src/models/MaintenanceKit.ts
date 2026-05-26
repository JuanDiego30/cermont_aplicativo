import { type Document, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// MaintenanceKit Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ name: string, required, unique
// ✓ activity_type: enum ['electrico', 'mecanico', 'civil', 'telecomunicaciones', 'hse']
// ✓ tools: [{name, quantity, specifications}]
// ✓ equipment: [{name, quantity, certificate_required}]
// ✓ is_active: boolean, default true
// ✓ created_by: ObjectId ref to User
// ✓ timestamps: createdAt, updatedAt
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────────────────────

export const ACTIVITY_TYPES = [
	"electrico",
	"mecanico",
	"civil",
	"telecomunicaciones",
	"hse",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ITool {
	name: string;
	quantity: number;
	specifications?: string;
}

export interface IEquipment {
	name: string;
	quantity: number;
	certificate_required: boolean;
}

export interface IMaintenanceKit extends Document {
	name: string;
	activity_type: ActivityType;
	tools: ITool[];
	equipment: IEquipment[];
	is_active: boolean;
	created_by: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const toolSchema = new Schema<ITool>(
	{
		name: { type: String, required: true, trim: true },
		quantity: { type: Number, required: true, min: 1 },
		specifications: { type: String, trim: true },
	},
	{ _id: false },
);

const equipmentSchema = new Schema<IEquipment>(
	{
		name: { type: String, required: true, trim: true },
		quantity: { type: Number, required: true, min: 1 },
		certificate_required: { type: Boolean, default: false },
	},
	{ _id: false },
);

// ── Main schema ──────────────────────────────────────────────────────────────

const kitTipicoSchema = new Schema<IMaintenanceKit>(
	{
		name: {
			type: String,
			required: [true, "Kit name is required"],
			unique: true,
			trim: true,
		},
		activity_type: {
			type: String,
			enum: ACTIVITY_TYPES,
			required: [true, "Activity type is required"],
			index: true,
		},
		tools: {
			type: [toolSchema],
			default: [],
			validate: {
				validator: (v: ITool[]) => v.length > 0,
				message: "Kit must have at least one tool",
			},
		},
		equipment: {
			type: [equipmentSchema],
			default: [],
		},
		is_active: {
			type: Boolean,
			default: true,
			index: true,
		},
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

// Compound indexes for common queries
kitTipicoSchema.index({ activity_type: 1, is_active: 1 });
kitTipicoSchema.index({ name: "text" });

export const MaintenanceKit = model<IMaintenanceKit>("MaintenanceKit", kitTipicoSchema);

// Legacy alias for backward compatibility
export const KitTipico = MaintenanceKit;
