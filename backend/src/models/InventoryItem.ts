import type { InventoryCategory, InventoryMovementType } from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";

export interface InventoryItemRecord {
	name: string;
	category: InventoryCategory;
	currentStock: number;
	minStock: number;
	unit: string;
	location?: string;
	lastMovementDate?: Date;
	notes?: string;
	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface StockMovementRecord {
	itemId: mongoose.Types.ObjectId;
	type: InventoryMovementType;
	quantity: number;
	reason?: string;
	userId: mongoose.Types.ObjectId;
	orderId?: mongoose.Types.ObjectId;
	movementDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

const inventoryItemSchema = new Schema<InventoryItemRecord>(
	{
		name: { type: String, required: true, maxlength: 200, trim: true },
		category: {
			type: String,
			enum: ["herramienta", "equipo", "material", "epp", "consumible", "otro"],
			required: true,
			index: true,
		},
		currentStock: { type: Number, required: true, min: 0, default: 0 },
		minStock: { type: Number, min: 0, default: 0 },
		unit: { type: String, required: true, maxlength: 30 },
		location: { type: String, maxlength: 200 },
		lastMovementDate: { type: Date },
		notes: { type: String, maxlength: 500 },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

inventoryItemSchema.index({ name: 1 }, { unique: true });
inventoryItemSchema.index({ category: 1, currentStock: 1 });

const stockMovementSchema = new Schema<StockMovementRecord>(
	{
		itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true, index: true },
		type: {
			type: String,
			enum: ["entrada", "salida", "ajuste", "prestamo", "devolucion"],
			required: true,
		},
		quantity: { type: Number, required: true },
		reason: { type: String, maxlength: 300 },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		orderId: { type: Schema.Types.ObjectId, ref: "Order" },
		movementDate: { type: Date, required: true },
	},
	{ timestamps: true },
);

stockMovementSchema.index({ itemId: 1, movementDate: -1 });

export const InventoryItemModel: Model<InventoryItemRecord> = mongoose.model<InventoryItemRecord>(
	"InventoryItem",
	inventoryItemSchema,
);

export const StockMovementModel: Model<StockMovementRecord> = mongoose.model<StockMovementRecord>(
	"StockMovement",
	stockMovementSchema,
);
