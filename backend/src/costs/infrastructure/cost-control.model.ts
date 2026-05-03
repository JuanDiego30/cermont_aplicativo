import { type Document, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// CostControl Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ order_id: ObjectId ref to Order (unique, one per order)
// ✓ currency: string, default 'COP'
// ✓ budget_estimated: number, required, min 0
// ✓ budget_approved: number, min 0 (optional)
// ✓ actual_items: [{category, description, unit, quantity, unit_price, total, isBudgeted, notes}]
// ✓ category: enum ['labor', 'materials', 'equipment', 'transport', 'subcontract', 'overhead', 'other']
// ✓ actual_total: number, auto-computed from items
// ✓ variance: number, auto-computed (actual - budget)
// ✓ variance_pct: number, auto-computed percentage
// ✓ closed: boolean, default false
// ✓ closed_at: date (optional)
// ✓ closed_by: ObjectId ref to User (optional)
// ✓ approved_by: ObjectId ref to User (optional)
// ✓ notes: string (optional)
// ✓ created_by: ObjectId ref to User
// ✓ timestamps: createdAt, updatedAt
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export type CostCategory =
	| "labor" // Mano de obra
	| "materials" // Materiales y repuestos
	| "equipment" // Alquiler de equipos
	| "transport" // Transporte y movilización
	| "subcontract" // Subcontratación
	| "overhead" // Gastos generales
	| "other";

export interface ICostLineItem {
	category: CostCategory;
	description: string;
	unit?: string; // e.g. "hora", "unidad", "m²"
	quantity: number;
	unit_price: number;
	total: number; // quantity * unit_price (auto-computed)
	isBudgeted: boolean; // true = fue presupuestado, false = emergió en campo
	notes?: string;
}

export interface ICostControl extends Document {
	order_id: Types.ObjectId;
	currency: string;

	// Budget snapshot (copied from Order.budget at creation time)
	budget_estimated: number;
	budget_approved?: number;

	// Actual cost tracking
	actual_items: ICostLineItem[];
	actual_total: number; // Sum of all actual_items (auto-computed)

	// Derived
	variance: number; // actual_total - budget_approved (or estimated)
	variance_pct: number; // variance / approved * 100

	// Status
	closed: boolean;
	closed_at?: Date;
	closed_by?: Types.ObjectId;
	approved_by?: Types.ObjectId;
	notes?: string;

	created_by: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const costLineItemSchema = new Schema<ICostLineItem>(
	{
		category: {
			type: String,
			enum: ["labor", "materials", "equipment", "transport", "subcontract", "overhead", "other"],
			required: true,
		},
		description: { type: String, required: true, trim: true },
		unit: { type: String, trim: true },
		quantity: { type: Number, required: true, min: 0 },
		unit_price: { type: Number, required: true, min: 0 },
		total: { type: Number, required: true, min: 0 },
		isBudgeted: { type: Boolean, required: true, default: true },
		notes: { type: String, trim: true },
	},
	{ _id: false },
);

// ── Main schema ──────────────────────────────────────────────────────────────

const costControlSchema = new Schema<ICostControl>(
	{
		order_id: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			unique: true, // one cost control per order
			index: true,
		},
		currency: { type: String, required: true, default: "COP", trim: true },

		budget_estimated: { type: Number, required: true, min: 0 },
		budget_approved: { type: Number, min: 0 },

		actual_items: { type: [costLineItemSchema], default: [] },
		actual_total: { type: Number, required: true, default: 0, min: 0 },

		variance: { type: Number, default: 0 },
		variance_pct: { type: Number, default: 0 },

		closed: { type: Boolean, required: true, default: false, index: true },
		closed_at: { type: Date },
		closed_by: { type: Schema.Types.ObjectId, ref: "User" },
		approved_by: { type: Schema.Types.ObjectId, ref: "User" },
		notes: { type: String, trim: true },

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

// Auto-compute line item totals, actual_total and variance before save
costControlSchema.pre("save", function () {
	// Recompute each line total
	for (const item of this.actual_items) {
		item.total = item.quantity * item.unit_price;
	}

	// Sum actual total
	this.actual_total = this.actual_items.reduce((sum, i) => sum + i.total, 0);

	// Compute variance against approved budget (fall back to estimated)
	const baseline = this.budget_approved ?? this.budget_estimated;
	this.variance = this.actual_total - baseline;
	this.variance_pct = baseline > 0 ? (this.variance / baseline) * 100 : 0;
});

export const CostControl = model<ICostControl>("CostControl", costControlSchema);
