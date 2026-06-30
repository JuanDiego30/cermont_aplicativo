import type { Order as OrderDto } from "@cermont/shared-types";
import {
	normalizeOrderStatus,
	ORDER_STATUS_VALUES,
	OrderPrioritySchema,
	OrderTypeSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";
import { tenantIsolationPlugin } from "./plugins/tenant-isolation";
import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

// ═══════════════════════════════════════════════════════════════════════════════
// Order Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: S.S.O.T utilizando OrderDto desde @cermont/shared-types
// ÍNDICES: Compuestos optimizados para queries frecuentes
// ═══════════════════════════════════════════════════════════════════════════════

// Sub-esquemas embebidos
const MaterialItemSchema = new Schema(
	{
		name: { type: String, required: true },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true },
		unitCost: { type: Number, min: 0 },
		delivered: { type: Boolean, default: false },
	},
	{ _id: false },
);

const GpsLocationSchema = new Schema(
	{
		lat: { type: Number, required: true },
		lng: { type: Number, required: true },
		accuracy: { type: Number },
		capturedAt: { type: Date, required: true },
	},
	{ _id: false },
);

// Single Source of Truth: Inherit from OrderDto
export type OrderDocumentFields = Omit<
	OrderDto,
	| "_id"
	| "gpsLocation"
	| "assignedTo"
	| "supervisedBy"
	| "proposalId"
	| "createdBy"
	| "createdAt"
	| "updatedAt"
	| "startedAt"
	| "completedAt"
> & {
	// Overrides for Mongoose-specific DB types
	gpsLocation?: { lat: number; lng: number; accuracy?: number; capturedAt: Date };
	assignedTo?: Types.ObjectId;
	assignedToName?: string;
	supervisedBy?: Types.ObjectId;
	proposalId?: Types.ObjectId;
	clientId?: Types.ObjectId;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	startedAt?: Date;
	completedAt?: Date;
	fileAssets: FileAssetRef[];
};

// Interfaz del documento Orden
export interface IOrderDocument extends OrderDocumentFields, Document {}

// Schema principal
const OrderSchema = new Schema<IOrderDocument>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
			match: /^OT-\d{6}-\d{4}$/,
		},
		type: {
			type: String,
			enum: OrderTypeSchema.options,
			required: true,
		},
		status: {
			type: String,
			enum: ORDER_STATUS_VALUES,
			default: "open",
			index: true,
			set: (value: unknown) => normalizeOrderStatus(value),
		},
		priority: {
			type: String,
			enum: OrderPrioritySchema.options,
			default: "medium",
			index: true,
		},
		description: { type: String, required: true, maxlength: 2000 },

		assetId: { type: String, required: true, index: true },
		assetName: { type: String, required: true },
		location: { type: String, required: true },
		gpsLocation: GpsLocationSchema,

		assignedTo: { type: Types.ObjectId, ref: "User", index: true },
		assignedToName: { type: String },
		supervisedBy: { type: Types.ObjectId, ref: "User" },

		materials: [MaterialItemSchema],

		startedAt: { type: Date },
		completedAt: { type: Date },
		observations: { type: String, maxlength: 3000 },
		invoiceReady: { type: Boolean, default: false },
		reportGenerated: { type: Boolean, default: false },

		proposalId: { type: Types.ObjectId, ref: "Proposal" },
		clientId: { type: Types.ObjectId, ref: "User", index: true },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
		fileAssets: { type: [FileAssetRefSchema], default: [] },

		// Custom fields for "other" values and extensions
		customFields: {
			type: Map,
			of: Schema.Types.Mixed,
			default: {},
		},
	},
	{ timestamps: true, versionKey: false },
);

// ═══════════════════════════════════════════════════════════════════════════════
// ÍNDICES COMPUESTOS — Optimización para queries frecuentes (per DOC-09 §9)
// ═══════════════════════════════════════════════════════════════════════════════

// Órdenes de un técnico por estado
OrderSchema.index({ status: 1, assignedTo: 1 });
// Listado ordenado por fecha
OrderSchema.index({ createdAt: -1 });
// Historial de un activo
OrderSchema.index({ assetId: 1, status: 1 });
OrderSchema.index({ clientId: 1, status: 1 });
OrderSchema.plugin(tenantIsolationPlugin);

// toJSON: limpiar __v de respuestas
OrderSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Order = model<IOrderDocument>("Order", OrderSchema);
