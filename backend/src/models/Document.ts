import { type Document as MongooseDocument, model, Schema, type Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// Document Model — Per DOC-09 §7 (Diccionario de Datos)
//
// ALIGNMENT WITH @cermont/shared-types:
// ✓ title: string, required
// ✓ file_url: string, required
// ✓ file_size: number (optional)
// ✓ mime_type: string (optional)
// ✓ uploaded_by: ObjectId ref to User
// ✓ order_id: ObjectId ref to Order (optional)
// ✓ signed: boolean, default false
// ✓ signedBy: ObjectId ref to User (optional)
// ✓ signedAt: date (optional)
// ✓ timestamps: createdAt, updatedAt
//
// NOTE: Mongoose schema is SSOT for persistence. shared-types schema is SSOT for API contracts.
// ═══════════════════════════════════════════════════════════════════════════════

export interface IDocument extends MongooseDocument {
	_id: Types.ObjectId;
	title: string;
	file_url: string;
	file_size?: number;
	mime_type?: string;
	uploaded_by: Types.ObjectId;
	order_id?: Types.ObjectId;
	signed?: boolean;
	signedBy?: Types.ObjectId;
	signedAt?: Date;
	purpose?: "library" | "template_source" | "closing_evidence" | "support_document";
	linkedEntityType?:
		| "service_case"
		| "work_request"
		| "site_visit"
		| "proposal"
		| "purchase_order"
		| "work_order"
		| "planning_packet"
		| "execution_session"
		| "technical_report"
		| "delivery_record"
		| "service_entry_sheet"
		| "invoice"
		| "payment"
		| "asset"
		| "maintenance_event"
		| "template_library"
		| "order"
		| "planning"
		| "execution"
		| "report"
		| "ses"
		| "maintenance";
	linkedEntityId?: Types.ObjectId;
	targetStepCode?: string;
	closingEvidenceKind?:
		| "acta_delivery"
		| "client_signature"
		| "ses_filing"
		| "ses_approval"
		| "invoice_sent"
		| "invoice_approval"
		| "payment_support"
		| "other_support";
	lifecycleStatus: "active" | "archived" | "deleted";
	archivedAt?: Date;
	archivedBy?: Types.ObjectId;
	archiveReason?: string;
	retentionUntil?: Date;
	deletedAt?: Date;
	deletedBy?: Types.ObjectId;
	deleteReason?: string;
	associations: Array<{
		orderId?: Types.ObjectId;
		serviceCaseId?: Types.ObjectId;
		purpose: "library" | "template_source" | "closing_evidence" | "support_document";
		targetStepCode?: string;
		requirementKey?: string;
		linkedEntityType?: IDocument["linkedEntityType"];
		linkedEntityId?: Types.ObjectId;
		createdBy: Types.ObjectId;
		createdAt: Date;
	}>;
}

const documentAssociationSchema = new Schema(
	{
		orderId: { type: Schema.Types.ObjectId, ref: "Order" },
		serviceCaseId: { type: Schema.Types.ObjectId, ref: "ServiceCase" },
		purpose: {
			type: String,
			enum: ["library", "template_source", "closing_evidence", "support_document"],
			required: true,
		},
		targetStepCode: { type: String },
		requirementKey: { type: String, trim: true },
		linkedEntityType: { type: String },
		linkedEntityId: { type: Schema.Types.ObjectId },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		createdAt: { type: Date, default: Date.now, required: true },
	},
	{ _id: false },
);

const documentSchema = new Schema<IDocument>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		file_url: {
			type: String,
			required: [true, "File URL is required"],
		},
		file_size: {
			type: Number,
		},
		mime_type: {
			type: String,
			trim: true,
		},
		uploaded_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
		order_id: {
			type: Schema.Types.ObjectId,
			ref: "Order",
		},
		signed: {
			type: Boolean,
			default: false,
		},
		signedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		signedAt: {
			type: Date,
		},
		purpose: {
			type: String,
			enum: ["library", "template_source", "closing_evidence", "support_document"],
		},
		linkedEntityType: {
			type: String,
		},
		linkedEntityId: {
			type: Schema.Types.ObjectId,
		},
		targetStepCode: {
			type: String,
		},
		closingEvidenceKind: {
			type: String,
			enum: [
				"acta_delivery",
				"client_signature",
				"ses_filing",
				"ses_approval",
				"invoice_sent",
				"invoice_approval",
				"payment_support",
				"other_support",
			],
		},
		lifecycleStatus: {
			type: String,
			enum: ["active", "archived", "deleted"],
			default: "active",
			required: true,
		},
		archivedAt: {
			type: Date,
		},
		archivedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		archiveReason: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		retentionUntil: {
			type: Date,
		},
		deletedAt: {
			type: Date,
		},
		deletedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		deleteReason: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		associations: {
			type: [documentAssociationSchema],
			default: [],
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform(_doc, ret) {
				const json = ret as Record<string, unknown>;
				delete json.__v;
				return ret;
			},
		},
	},
);

// Compound index for common query patterns
documentSchema.index({ order_id: 1, signed: 1 });
documentSchema.index({ "associations.orderId": 1, "associations.serviceCaseId": 1 });
documentSchema.index({ lifecycleStatus: 1, retentionUntil: 1 });

const DocumentModel = model<IDocument>("Document", documentSchema);

export { DocumentModel as Document };
