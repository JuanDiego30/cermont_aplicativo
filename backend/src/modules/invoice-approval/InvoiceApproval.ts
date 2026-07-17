import { InvoiceApprovalStatusSchema, InvoiceRejectionReasonSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export interface InvoiceApprovalDocument extends Document {
	_id: Types.ObjectId;
	invoiceId: Types.ObjectId;
	workOrderId: Types.ObjectId;
	clientId: Types.ObjectId;
	clientName: string;
	clientEmail?: string;
	requestedBy: Types.ObjectId;
	requestedAt: Date;
	status: "pending" | "approved" | "rejected" | "cancelled";
	approvedAt?: Date;
	approvedBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectionReason?:
		| "amount_incorrect"
		| "service_not_completed"
		| "missing_supporting_documents"
		| "duplicate_invoice"
		| "contractual_discrepancy"
		| "tax_info_incorrect"
		| "other";
	rejectionDetails?: string;
	correctedAt?: Date;
	correctedBy?: Types.ObjectId;
	correctionNotes?: string;
	notifiedAt?: Date;
	reminderSentAt: Date[];
	expiresAt?: Date;
	clientMutationId?: string;
	metadata?: Record<string, unknown>;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const invoiceApprovalSchema = new Schema<InvoiceApprovalDocument>(
	{
		invoiceId: { type: Types.ObjectId, ref: "Invoice", required: true, index: true },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		clientId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		clientName: { type: String, required: true, maxlength: 200 },
		clientEmail: { type: String, maxlength: 320 },
		requestedBy: { type: Types.ObjectId, ref: "User", required: true },
		requestedAt: { type: Date, required: true, default: Date.now },
		status: {
			type: String,
			enum: InvoiceApprovalStatusSchema.options,
			default: "pending",
			index: true,
		},
		approvedAt: { type: Date },
		approvedBy: { type: Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, enum: InvoiceRejectionReasonSchema.options },
		rejectionDetails: { type: String, maxlength: 1000 },
		correctedAt: { type: Date },
		correctedBy: { type: Types.ObjectId, ref: "User" },
		correctionNotes: { type: String, maxlength: 1000 },
		notifiedAt: { type: Date },
		reminderSentAt: { type: [Date], default: [] },
		expiresAt: { type: Date },
		clientMutationId: { type: String, index: true, sparse: true },
		metadata: { type: Map, of: Schema.Types.Mixed },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, versionKey: false },
);

invoiceApprovalSchema.index({ invoiceId: 1, status: 1 });
invoiceApprovalSchema.index({ clientId: 1, status: 1 });
invoiceApprovalSchema.index({ clientMutationId: 1 }, { unique: true, sparse: true });

export const InvoiceApproval = model<InvoiceApprovalDocument>(
	"InvoiceApproval",
	invoiceApprovalSchema,
);
