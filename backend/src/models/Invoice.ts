import {
	BillingCurrencySchema,
	type InvoiceDocumentType,
	type InvoiceElectronicDocumentType,
	InvoiceStatusSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

const invoiceLineSchema = new Schema(
	{
		description: { type: String, required: true, maxlength: 300 },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true, maxlength: 50 },
		unitPrice: { type: Number, required: true, min: 0 },
		total: { type: Number, required: true, min: 0 },
	},
	{ _id: false },
);

const taxBreakdownSchema = new Schema(
	{
		name: { type: String, required: true, maxlength: 120 },
		rate: { type: Number, required: true, min: 0, max: 1 },
		amount: { type: Number, required: true, min: 0 },
	},
	{ _id: false },
);

const invoiceAttachmentSchema = new Schema(
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

export interface InvoiceDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workOrderId: Types.ObjectId;
	workOrderCode?: string;
	serviceEntrySheetId?: Types.ObjectId;
	serviceEntrySheetCode?: string;
	serviceCaseId?: Types.ObjectId;
	clientId: Types.ObjectId;
	clientName: string;
	billingAccount?: string;
	invoiceNumber?: string;
	amount: number;
	taxAmount: number;
	totalAmount: number;
	currency: string;
	issuedAt?: Date;
	sentAt?: Date;
	submittedAt?: Date;
	submittedBy?: Types.ObjectId;
	approvedAt?: Date;
	approvedBy?: Types.ObjectId;
	acceptedAt?: Date;
	acceptedBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectionReason?: string;
	paidAt?: Date;
	paymentReference?: string;
	issueDate?: Date;
	dueDate?: Date;
	invoiceLines: Array<{
		description: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		total: number;
	}>;
	taxBreakdown: Array<{ name: string; rate: number; amount: number }>;
	subtotal?: number;
	total?: number;
	status: string;
	attachments: Array<{
		id?: Types.ObjectId;
		url: string;
		type: string;
		name: string;
		uploadedAt: Date;
	}>;
	commandHistory: Array<{ clientMutationId: string; command: string; recordedAt: Date }>;
	notes?: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	seller?: {
		nit: string;
		businessName: string;
		address: string;
		phone: string;
		email: string;
	};
	buyer?: {
		documentType: InvoiceDocumentType;
		documentNumber: string;
		businessName: string;
		address: string;
		email: string;
	};
	lineItems?: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		discount?: number;
		subtotal: number;
	}>;
	taxBase?: number;
	ivaRate?: number;
	ivaAmount?: number;
	retentionRate?: number;
	retentionAmount?: number;
	cufe?: string;
	qrCode?: string;
	paymentMethod?: string;
	numeroResolucion?: string;
	totalConIva?: number;
	retencionFuente?: number;
	nitEmisor?: string;
	nitReceptor?: string;
	tipoDocumento?: InvoiceElectronicDocumentType;
}

const invoiceSchema = new Schema<InvoiceDocument>(
	{
		code: { type: String, required: true, unique: true, index: true },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		workOrderCode: { type: String },
		serviceEntrySheetId: { type: Types.ObjectId, ref: "ServiceEntrySheet", index: true },
		serviceEntrySheetCode: { type: String },
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		clientId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		clientName: { type: String, required: true, maxlength: 200 },
		billingAccount: { type: String, maxlength: 200 },
		invoiceNumber: { type: String, maxlength: 120 },
		amount: { type: Number, required: true, min: 0 },
		taxAmount: { type: Number, default: 0, min: 0 },
		totalAmount: { type: Number, required: true, min: 0 },
		currency: { type: String, enum: BillingCurrencySchema.options, default: "COP" },
		issuedAt: { type: Date },
		sentAt: { type: Date },
		submittedAt: { type: Date },
		submittedBy: { type: Types.ObjectId, ref: "User" },
		approvedAt: { type: Date },
		approvedBy: { type: Types.ObjectId, ref: "User" },
		acceptedAt: { type: Date },
		acceptedBy: { type: Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, maxlength: 500 },
		paidAt: { type: Date },
		paymentReference: { type: String, maxlength: 100 },
		issueDate: { type: Date },
		dueDate: { type: Date },
		invoiceLines: { type: [invoiceLineSchema], default: [] },
		taxBreakdown: { type: [taxBreakdownSchema], default: [] },
		subtotal: { type: Number, min: 0 },
		total: { type: Number, min: 0 },
		status: { type: String, enum: InvoiceStatusSchema.options, default: "draft", index: true },
		attachments: { type: [invoiceAttachmentSchema], default: [] },
		commandHistory: { type: [commandHistoryEntrySchema], default: [] },
		notes: { type: String, maxlength: 1000 },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
		seller: {
			nit: { type: String },
			businessName: { type: String },
			address: { type: String },
			phone: { type: String },
			email: { type: String },
		},
		buyer: {
			documentType: { type: String },
			documentNumber: { type: String },
			businessName: { type: String },
			address: { type: String },
			email: { type: String },
		},
		lineItems: [
			{
				description: { type: String },
				quantity: { type: Number },
				unitPrice: { type: Number },
				discount: { type: Number },
				subtotal: { type: Number },
			},
		],
		taxBase: { type: Number },
		ivaRate: { type: Number },
		ivaAmount: { type: Number },
		retentionRate: { type: Number },
		retentionAmount: { type: Number },
		cufe: { type: String },
		qrCode: { type: String },
		paymentMethod: { type: String },
		numeroResolucion: { type: String },
		totalConIva: { type: Number },
		retencionFuente: { type: Number, default: 0 },
		nitEmisor: { type: String },
		nitReceptor: { type: String },
		tipoDocumento: { type: String, default: "FV" },
	},
	{ timestamps: true, versionKey: false },
);

invoiceSchema.index(
	{ serviceEntrySheetId: 1 },
	{ unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
invoiceSchema.index({ workOrderId: 1, status: 1 });
invoiceSchema.index({ serviceCaseId: 1 });
invoiceSchema.index({ createdAt: -1 });

export const Invoice = model<InvoiceDocument>("Invoice", invoiceSchema);
