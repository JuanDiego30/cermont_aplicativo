import {
	PaymentCurrencySchema,
	PaymentMethodSchema,
	PaymentStatusSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const paymentCommandHistorySchema = new Schema(
	{
		clientMutationId: { type: String, required: true },
		command: { type: String, required: true, maxlength: 80 },
		recordedAt: { type: Date, required: true },
	},
	{ _id: false },
);

export interface PaymentDocument extends Document {
	_id: Types.ObjectId;
	invoiceId: Types.ObjectId;
	workOrderId: Types.ObjectId;
	serviceEntrySheetId: Types.ObjectId;
	serviceCaseId?: Types.ObjectId;
	clientId: Types.ObjectId;
	paymentReference: string;
	paidAt: Date;
	amount: number;
	currency: string;
	paymentMethod: string;
	bankReference?: string;
	supportingDocument?: string;
	supportingDocumentUrl?: string;
	recordedBy: Types.ObjectId;
	recordedAt: Date;
	reconciledBy?: Types.ObjectId;
	reconciledAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectionReason?: string;
	commandHistory: Array<{ clientMutationId: string; command: string; recordedAt: Date }>;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
	{
		invoiceId: { type: Types.ObjectId, ref: "Invoice", required: true, index: true },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		serviceEntrySheetId: {
			type: Types.ObjectId,
			ref: "ServiceEntrySheet",
			required: true,
			index: true,
		},
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		clientId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		paymentReference: { type: String, required: true, maxlength: 100, index: true },
		paidAt: { type: Date, required: true },
		amount: { type: Number, required: true, min: 0 },
		currency: { type: String, enum: PaymentCurrencySchema.options, default: "COP" },
		paymentMethod: { type: String, enum: PaymentMethodSchema.options, default: "bank_transfer" },
		bankReference: { type: String, maxlength: 150 },
		supportingDocument: { type: String, maxlength: 500 },
		supportingDocumentUrl: { type: String, maxlength: 500 },
		recordedBy: { type: Types.ObjectId, ref: "User", required: true },
		recordedAt: { type: Date, required: true },
		reconciledBy: { type: Types.ObjectId, ref: "User" },
		reconciledAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectionReason: { type: String, maxlength: 500 },
		commandHistory: { type: [paymentCommandHistorySchema], default: [] },
		status: { type: String, enum: PaymentStatusSchema.options, default: "recorded", index: true },
	},
	{ timestamps: true, versionKey: false },
);

paymentSchema.index({ invoiceId: 1, paymentReference: 1 }, { unique: true });
paymentSchema.index({ status: 1, invoiceId: 1 });
paymentSchema.index({ workOrderId: 1, status: 1 });
paymentSchema.index({ serviceCaseId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = model<PaymentDocument>("Payment", paymentSchema);
