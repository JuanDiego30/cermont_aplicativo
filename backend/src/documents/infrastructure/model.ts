import { type Document as MongooseDocument, model, Schema } from "mongoose";

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
	title: string;
	category: "general" | "ast" | "ptw" | "support" | "delivery_record" | "billing_support";
	file_url: string;
	file_size?: number;
	mime_type?: string;
	uploaded_by: Schema.Types.ObjectId;
	order_id?: Schema.Types.ObjectId;
	phase: "planning" | "execution" | "closure";
	signed?: boolean;
	signedBy?: Schema.Types.ObjectId;
	signedAt?: Date;
}

const documentSchema = new Schema<IDocument>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		category: {
			type: String,
			enum: ["general", "ast", "ptw", "support", "delivery_record", "billing_support"],
			default: "general",
			required: [true, "Category is required"],
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
		phase: {
			type: String,
			enum: ["planning", "execution", "closure"],
			default: "planning",
			index: true,
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
documentSchema.index({ order_id: 1, phase: 1 });

const DocumentModel = model<IDocument>("Document", documentSchema);

export { DocumentModel as Document };
