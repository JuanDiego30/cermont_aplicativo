import { BillingCurrencySchema, ServiceEntrySheetStatusSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const billingServiceLineSchema = new Schema(
	{
		description: { type: String, required: true, maxlength: 300 },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true, maxlength: 50 },
		unitPrice: { type: Number, required: true, min: 0 },
		total: { type: Number, required: true, min: 0 },
	},
	{ _id: false },
);

const billingTaxLineSchema = new Schema(
	{
		name: { type: String, required: true, maxlength: 120 },
		rate: { type: Number, required: true, min: 0, max: 1 },
		amount: { type: Number, required: true, min: 0 },
	},
	{ _id: false },
);

const billingAttachmentSchema = new Schema(
	{
		id: { type: Types.ObjectId, ref: "Document" },
		url: { type: String, required: true, maxlength: 500 },
		type: { type: String, required: true },
		name: { type: String, required: true, maxlength: 200 },
		uploadedAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const commandHistoryEntrySchema = new Schema(
	{
		clientMutationId: { type: String, required: true },
		command: { type: String, required: true, maxlength: 80 },
		recordedAt: { type: Date, required: true },
	},
	{ _id: false },
);

export interface ServiceEntrySheetDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workOrderId?: Types.ObjectId;
	workOrderCode?: string;
	deliveryRecordId?: Types.ObjectId;
	technicalReportId?: Types.ObjectId;
	serviceCaseId?: Types.ObjectId;
	clientId: Types.ObjectId;
	clientName: string;
	billingAccount?: string;
	aribaReference?: string;
	aribaDocumentNumber?: string;
	submittedAt?: Date;
	submittedBy?: Types.ObjectId;
	approvedAt?: Date;
	approvedBy?: Types.ObjectId;
	approverReference?: string;
	rejectedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectionReason?: string;
	amount: number;
	currency: string;
	taxAmount: number;
	totalAmount: number;
	serviceLines: Array<{
		description: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		total: number;
	}>;
	subtotal?: number;
	taxLines: Array<{ name: string; rate: number; amount: number }>;
	total?: number;
	description?: string;
	status: string;
	attachments: Array<{
		id?: Types.ObjectId;
		url: string;
		type: string;
		name: string;
		uploadedAt: Date;
	}>;
	commandHistory: Array<{ clientMutationId: string; command: string; recordedAt: Date }>;
	createdBy: Types.ObjectId;
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const serviceEntrySheetSchema = new Schema<ServiceEntrySheetDocument>(
	{
		code: { type: String, required: true, unique: true, index: true },
		workOrderId: { type: Types.ObjectId, ref: "Order", index: true },
		workOrderCode: { type: String },
		deliveryRecordId: { type: Types.ObjectId, ref: "DeliveryRecord", index: true },
		technicalReportId: { type: Types.ObjectId, ref: "TechnicalReport" },
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		clientId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		clientName: { type: String, required: true, maxlength: 200 },
		billingAccount: { type: String, maxlength: 200 },
		aribaReference: { type: String, maxlength: 160 },
		aribaDocumentNumber: { type: String, maxlength: 120 },
		submittedAt: { type: Date },
		submittedBy: { type: Types.ObjectId, ref: "User" },
		approvedAt: { type: Date },
		approvedBy: { type: Types.ObjectId, ref: "User" },
		approverReference: { type: String, maxlength: 160 },
		rejectedAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, maxlength: 500 },
		amount: { type: Number, required: true, min: 0 },
		currency: { type: String, enum: BillingCurrencySchema.options, default: "COP" },
		taxAmount: { type: Number, default: 0, min: 0 },
		totalAmount: { type: Number, required: true, min: 0 },
		serviceLines: { type: [billingServiceLineSchema], default: [] },
		subtotal: { type: Number, min: 0 },
		taxLines: { type: [billingTaxLineSchema], default: [] },
		total: { type: Number, min: 0 },
		description: { type: String, maxlength: 1000 },
		status: {
			type: String,
			enum: ServiceEntrySheetStatusSchema.options,
			default: "draft",
			index: true,
		},
		attachments: { type: [billingAttachmentSchema], default: [] },
		commandHistory: { type: [commandHistoryEntrySchema], default: [] },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: true, versionKey: false },
);

serviceEntrySheetSchema.index(
	{ deliveryRecordId: 1 },
	{ unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
serviceEntrySheetSchema.index({ workOrderId: 1, status: 1 });
serviceEntrySheetSchema.index({ serviceCaseId: 1 });
serviceEntrySheetSchema.index({ createdAt: -1 });

export const ServiceEntrySheet = model<ServiceEntrySheetDocument>(
	"ServiceEntrySheet",
	serviceEntrySheetSchema,
);
