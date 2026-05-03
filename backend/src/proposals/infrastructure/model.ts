import { type Document, model, Schema, Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// Proposal Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: Los enums coinciden con @cermont/shared-types (ProposalStatusSchema)
// ÍNDICES: Compuestos optimizados para queries frecuentes
// ═══════════════════════════════════════════════════════════════════════════════

// Sub-esquema para ítems de propuesta
const ProposalItemSchema = new Schema(
	{
		description: { type: String, required: true, maxlength: 300 },
		unit: { type: String, required: true },
		quantity: { type: Number, required: true, min: 0 },
		unitCost: { type: Number, required: true, min: 0 },
		total: { type: Number, required: true, min: 0 },
	},
	{ _id: false },
);

// Interfaz del documento Propuesta
export interface IProposalDocument extends Document {
	code: string;
	title: string;
	clientName: string;
	clientEmail?: string;
	status: "draft" | "sent" | "approved" | "rejected" | "expired";
	validUntil: Date;
	items: Array<{
		description: string;
		unit: string;
		quantity: number;
		unitCost: number;
		total: number;
	}>;
	subtotal: number;
	taxRate: number;
	total: number;
	notes?: string;
	poNumber?: string;
	createdBy: Types.ObjectId;
	approvedBy?: Types.ObjectId;
	approvedAt?: Date;
	generatedOrders: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const ProposalSchema = new Schema<IProposalDocument>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
			match: /^PROP-\d{4}-\d{4}$/,
		},
		title: { type: String, required: true, minlength: 5, maxlength: 200 },
		clientName: { type: String, required: true, minlength: 2, maxlength: 200 },
		clientEmail: { type: String },
		status: {
			type: String,
			enum: ["draft", "sent", "approved", "rejected", "expired"],
			default: "draft",
			index: true,
		},
		validUntil: { type: Date, required: true },
		items: [ProposalItemSchema],
		subtotal: { type: Number, required: true, min: 0 },
		taxRate: { type: Number, default: 0.19, min: 0, max: 1 },
		total: { type: Number, required: true, min: 0 },
		notes: { type: String, maxlength: 2000 },
		poNumber: { type: String, trim: true },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
		approvedBy: { type: Types.ObjectId, ref: "User" },
		approvedAt: { type: Date },
		generatedOrders: [{ type: Types.ObjectId, ref: "Order" }],
	},
	{ timestamps: true, versionKey: false },
);

// ═══════════════════════════════════════════════════════════════════════════════
// ÍNDICES COMPUESTOS — Optimización para queries frecuentes (per DOC-09 §9)
// ═══════════════════════════════════════════════════════════════════════════════

ProposalSchema.index({ status: 1, createdAt: -1 });
ProposalSchema.index({ createdBy: 1, createdAt: -1 });
ProposalSchema.index({ validUntil: 1 });

// toJSON: limpiar __v de respuestas
ProposalSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Proposal = model<IProposalDocument>("Proposal", ProposalSchema);
