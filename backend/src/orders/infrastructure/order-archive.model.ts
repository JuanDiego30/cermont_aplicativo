import { type Document, model, Schema, type Types } from "mongoose";

export interface IOrderArchiveDocument extends Document {
	orderId: Types.ObjectId;
	orderCode: string;
	period: string;
	snapshot: Record<string, unknown>;
	archivedAt: Date;
}

const OrderArchiveSchema = new Schema<IOrderArchiveDocument>(
	{
		orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
		orderCode: { type: String, required: true, index: true },
		period: { type: String, required: true, index: true },
		snapshot: { type: Schema.Types.Mixed, required: true },
		archivedAt: { type: Date, required: true, default: Date.now },
	},
	{ timestamps: true, versionKey: false },
);

OrderArchiveSchema.index({ period: 1, orderCode: 1 });

export const OrderArchive = model<IOrderArchiveDocument>("OrderArchive", OrderArchiveSchema);
