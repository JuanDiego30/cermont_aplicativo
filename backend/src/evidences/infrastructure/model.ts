import { type Document, model, Schema, Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// Evidence Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: Los enums coinciden con @cermont/shared-types (EvidenceTypeSchema)
// ÍNDICES: Compuestos optimizados para queries frecuentes
// ═══════════════════════════════════════════════════════════════════════════════

// Interfaz del documento Evidencia
export interface IEvidenceDocument extends Document {
	orderId: Types.ObjectId;
	type: "before" | "during" | "after" | "defect" | "safety" | "signature";
	idempotencyKey?: string;
	filename: string;
	url: string;
	mimeType: string;
	sizeBytes: number;
	description?: string;
	gpsLocation?: { lat: number; lng: number; capturedAt: Date };
	capturedAt: Date;
	uploadedAt: Date;
	uploadedBy: Types.ObjectId;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidenceDocument>(
	{
		orderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		type: {
			type: String,
			enum: ["before", "during", "after", "defect", "safety", "signature"],
			required: true,
		},
		idempotencyKey: { type: String },
		filename: { type: String, required: true },
		url: { type: String, required: true }, // URL pública del archivo
		mimeType: { type: String, required: true },
		sizeBytes: { type: Number, required: true },
		description: { type: String, maxlength: 500 },
		gpsLocation: {
			lat: { type: Number },
			lng: { type: Number },
			capturedAt: { type: Date },
		},
		capturedAt: { type: Date, required: true },
		uploadedAt: { type: Date, default: Date.now },
		uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
		deletedAt: { type: Date, default: null, index: true },
	},
	{ timestamps: true, versionKey: false },
);

// ═══════════════════════════════════════════════════════════════════════════════
// ÍNDICES COMPUESTOS — Optimización para queries frecuentes (per DOC-09 §9)
// ═══════════════════════════════════════════════════════════════════════════════

// Evidencias de una orden por tipo
EvidenceSchema.index({ orderId: 1, type: 1 });
EvidenceSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
// Historial de uploads por usuario
EvidenceSchema.index({ uploadedBy: 1, createdAt: -1 });
// Búsqueda directa por usuario (standalone)
EvidenceSchema.index({ uploadedBy: 1 });

// toJSON: limpiar __v de respuestas
EvidenceSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Evidence = model<IEvidenceDocument>("Evidence", EvidenceSchema);
