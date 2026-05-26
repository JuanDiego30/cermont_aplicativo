import {
	normalizePurchaseOrderStatus,
	PURCHASE_ORDER_PERSISTED_STATUS_VALUES,
	PurchaseOrderCurrencySchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const poAttachmentSchema = new Schema(
	{
		url: { type: String, required: true },
		filename: { type: String, required: true, maxlength: 255 },
		uploadedAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

export interface PurchaseOrderDocument extends Document {
	_id: Types.ObjectId;
	proposalId: Types.ObjectId;
	poNumber: string;
	contractReference?: string;
	serviceAccount: string;
	billingAccount: string;
	approvedAmount: number;
	currency: string;
	receivedAt: Date;
	attachments: Array<{ url: string; filename: string; uploadedAt: Date }>;
	validatedBy?: Types.ObjectId;
	status: string;
	rejectionReason?: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const purchaseOrderSchema = new Schema<PurchaseOrderDocument>(
	{
		proposalId: { type: Types.ObjectId, ref: "Proposal", required: true, index: true },
		poNumber: { type: String, required: true, maxlength: 100, index: true },
		contractReference: { type: String, maxlength: 150 },
		serviceAccount: { type: String, required: true, maxlength: 100 },
		billingAccount: { type: String, required: true, maxlength: 100 },
		approvedAmount: { type: Number, required: true, min: 0 },
		currency: { type: String, enum: PurchaseOrderCurrencySchema.options, default: "COP" },
		receivedAt: { type: Date, required: true },
		attachments: { type: [poAttachmentSchema], default: [] },
		validatedBy: { type: Types.ObjectId, ref: "User" },
		status: {
			type: String,
			enum: PURCHASE_ORDER_PERSISTED_STATUS_VALUES,
			default: "pending",
			index: true,
			set: (value: unknown) => normalizePurchaseOrderStatus(value),
		},
		rejectionReason: { type: String, maxlength: 500 },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

export const PurchaseOrderModel = model<PurchaseOrderDocument>(
	"PurchaseOrder",
	purchaseOrderSchema,
);
