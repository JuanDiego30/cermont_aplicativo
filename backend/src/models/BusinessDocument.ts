/**
 * BusinessDocument Mongoose Model
 *
 * Stores digitized business format templates (PDF, Excel, DOCX)
 * with their field mappings for dynamic form generation.
 */
import { model, Schema } from "mongoose";
import { optimisticConcurrency } from "./plugins/optimistic-concurrency";

const BusinessDocumentFieldMappingSchema = new Schema(
	{
		fieldName: { type: String, required: true },
		fieldType: {
			type: String,
			enum: [
				"text",
				"number",
				"date",
				"signature",
				"photo",
				"checkbox",
				"select",
				"table",
				"textarea",
			],
			required: true,
		},
		xpath: String,
		required: { type: Boolean, default: false },
		validation: String,
	},
	{ _id: false },
);

const BusinessDocumentMetadataSchema = new Schema(
	{
		title: { type: String, required: true },
		description: String,
		businessUnit: [String],
		regulatoryBody: String,
	},
	{ _id: false },
);

const BusinessDocumentSchema = new Schema(
	{
		documentType: {
			type: String,
			required: true,
			enum: [
				"work_planning",
				"cctv_maintenance",
				"lifeline_inspection",
				"sgsst_induction",
				"ladder_anchor_photo",
				"safety_control_hierarchy",
				"field_permit",
				"ast_safety_analysis",
			],
		},
		formatType: { type: String, required: true, enum: ["pdf", "xlsx", "docx", "image", "hybrid"] },
		version: { type: String, required: true },
		sourceFile: { type: String, required: true },
		fieldMappings: { type: [BusinessDocumentFieldMappingSchema], required: true },
		metadata: { type: BusinessDocumentMetadataSchema, required: true },
		lifecycleStatus: { type: String, enum: ["active", "deleted"], default: "active" },
	},
	{ timestamps: true },
);

BusinessDocumentSchema.plugin(optimisticConcurrency);

BusinessDocumentSchema.index({ documentType: 1, lifecycleStatus: 1 });
BusinessDocumentSchema.index({ "metadata.regulatoryBody": 1 });

export const BusinessDocument = model("BusinessDocument", BusinessDocumentSchema);
