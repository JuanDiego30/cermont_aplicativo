import { type Document, model, Schema, type Types } from "mongoose";

/**
 * TemplateDraft Mongoose Model
 *
 * Represents a proposed template generated from extracted document layout data.
 * Must be reviewed and approved before conversion to a published DocumentTemplateVersion.
 *
 * Maps to @cermont/shared-types/schemas/template-draft.schema.ts
 */

// ─── Subdocument Schemas ─────────────────────────────────────────────────────────

const TemplateDraftFieldSchema = new Schema(
	{
		fieldId: { type: String, required: true },
		label: { type: String, required: true, maxlength: 500 },
		normalizedName: { type: String, required: true, maxlength: 200 },
		fieldKind: { type: String, required: true },
		required: { type: Boolean, default: false },
		order: { type: Number, default: 0, min: 0 },
		confidence: { type: Number, min: 0, max: 1 },
		options: [{ type: String }],
		allowOtherOption: { type: Boolean, default: false },
		otherOptionLabel: { type: String, maxlength: 200 },
		validationRules: [{ type: Object }],
		helpText: { type: String, maxlength: 1000 },
		placeholder: { type: String, maxlength: 500 },
		defaultValue: { type: String, maxlength: 1000 },
		readOnly: { type: Boolean, default: false },
		visible: { type: Boolean, default: true },
		visibleWhen: { type: Object },
		requiredWhen: { type: Object },
		sourceReference: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const TemplateDraftTableColumnSchema = new Schema(
	{
		columnId: { type: String, required: true },
		name: { type: String, required: true, maxlength: 200 },
		fieldKind: { type: String, required: true },
		required: { type: Boolean, default: false },
		options: [{ type: String }],
		width: { type: String, maxlength: 50 },
	},
	{ _id: false },
);

const TemplateDraftTableSchema = new Schema(
	{
		tableId: { type: String, required: true },
		title: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		columns: { type: [TemplateDraftTableColumnSchema], required: true },
		allowAddRows: { type: Boolean, default: true },
		allowDeleteRows: { type: Boolean, default: true },
		maxRows: { type: Number },
		sourceReference: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const _TemplateDraftSectionSchema = new Schema(
	{
		sectionId: { type: String, required: true },
		title: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		order: { type: Number, required: true, min: 0 },
		fields: { type: [TemplateDraftFieldSchema], default: [] },
		tables: { type: [TemplateDraftTableSchema], default: [] },
		repeatable: { type: Boolean, default: false },
		required: { type: Boolean, default: false },
		sourceReference: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const _TemplateDraftRuleSchema = new Schema(
	{
		ruleId: { type: String, required: true },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 1000 },
		trigger: { type: String, enum: ["on_load", "on_change", "on_submit"], required: true },
		condition: { type: String, required: true, maxlength: 2000 },
		action: {
			type: String,
			enum: ["show", "hide", "enable", "disable", "set_value", "require"],
			required: true,
		},
		targetFieldId: { type: String },
		value: { type: String, maxlength: 1000 },
		priority: { type: Number, default: 0, min: 0 },
		active: { type: Boolean, default: true },
	},
	{ _id: false },
);

const _TemplateDraftExportHintSchema = new Schema(
	{
		format: { type: String, enum: ["pdf", "xlsx", "csv", "json", "html"], required: true },
		orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
		pageSize: { type: String, enum: ["A4", "Letter", "Legal"], default: "A4" },
		showHeader: { type: Boolean, default: true },
		showFooter: { type: Boolean, default: true },
		showLogo: { type: Boolean, default: true },
		showPageNumbers: { type: Boolean, default: true },
	},
	{ _id: false },
);

// ─── Main Document Interface ───────────────────────────────────────────────────

type TemplateDraftValidationRule = Record<string, unknown>;

interface TemplateDraftField {
	fieldId: string;
	label: string;
	normalizedName: string;
	fieldKind: string;
	required: boolean;
	order: number;
	confidence?: number;
	options: string[];
	allowOtherOption?: boolean;
	otherOptionLabel?: string;
	validationRules: TemplateDraftValidationRule[];
	helpText?: string;
	placeholder?: string;
	defaultValue?: string;
	readOnly?: boolean;
	visible?: boolean;
	visibleWhen?: TemplateDraftValidationRule;
	requiredWhen?: TemplateDraftValidationRule;
	sourceReference?: string;
}

interface TemplateDraftTableColumn {
	columnId: string;
	name: string;
	fieldKind: string;
	required: boolean;
	options?: string[];
	width?: string;
}

interface TemplateDraftTable {
	tableId: string;
	title: string;
	description?: string;
	columns: TemplateDraftTableColumn[];
	allowAddRows: boolean;
	allowDeleteRows: boolean;
	maxRows?: number;
	sourceReference?: string;
}

interface TemplateDraftSection {
	sectionId: string;
	title: string;
	description?: string;
	order: number;
	fields: TemplateDraftField[];
	tables: TemplateDraftTable[];
	repeatable: boolean;
	required: boolean;
	sourceReference?: string;
}

interface TemplateDraftRule {
	ruleId: string;
	name: string;
	description?: string;
	trigger: "on_load" | "on_change" | "on_submit";
	condition: string;
	action: "show" | "hide" | "enable" | "disable" | "set_value" | "require";
	targetFieldId?: string;
	value?: string;
	priority: number;
	active: boolean;
}

interface TemplateDraftExportHint {
	format: "pdf" | "xlsx" | "csv" | "json" | "html";
	orientation?: "portrait" | "landscape";
	pageSize?: "A4" | "Letter" | "Legal";
	showHeader?: boolean;
	showFooter?: boolean;
	showLogo?: boolean;
	showPageNumbers?: boolean;
}

export interface ITemplateDraftDocument extends Document {
	_id: Types.ObjectId;
	documentSourceFileId: Types.ObjectId;
	extractionJobId: Types.ObjectId;
	name: string;
	description?: string;
	serviceTypes: string[];
	targetStages: string[];
	targetStepCode?: string;
	sections: TemplateDraftSection[];
	tables: TemplateDraftTable[];
	rules: TemplateDraftRule[];
	exportHints: TemplateDraftExportHint[];
	confidence?: number;
	status: "draft" | "review_required" | "approved" | "rejected" | "converted_to_template";
	reviewerId?: Types.ObjectId;
	reviewedAt?: Date;
	reviewerNotes?: string;
	rejectionReason?: string;
	convertedTemplateVersionId?: Types.ObjectId;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Main Schema ────────────────────────────────────────────────────────────────

const TemplateDraftSchema = new Schema<ITemplateDraftDocument>(
	{
		documentSourceFileId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
		extractionJobId: { type: Schema.Types.ObjectId, ref: "DocumentExtractionJob", required: true },
		name: { type: String, required: true, maxlength: 200 },
		description: { type: String, maxlength: 2000 },
		serviceTypes: { type: [String], default: [] },
		targetStages: { type: [String], default: [] },
		targetStepCode: { type: String, index: true },
		sections: { type: Schema.Types.Mixed, required: true },
		tables: { type: Schema.Types.Mixed, default: [] },
		rules: { type: Schema.Types.Mixed, default: [] },
		exportHints: { type: Schema.Types.Mixed, default: [] },
		confidence: { type: Number, min: 0, max: 1 },
		status: {
			type: String,
			enum: ["draft", "review_required", "approved", "rejected", "converted_to_template"],
			default: "draft",
		},
		reviewerId: { type: Schema.Types.ObjectId, ref: "User" },
		reviewedAt: { type: Date },
		reviewerNotes: { type: String, maxlength: 2000 },
		rejectionReason: { type: String },
		convertedTemplateVersionId: { type: Schema.Types.ObjectId },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

TemplateDraftSchema.index({ status: 1 });
TemplateDraftSchema.index({ serviceTypes: 1 });
TemplateDraftSchema.index({ targetStages: 1 });
TemplateDraftSchema.index({ documentSourceFileId: 1 });
TemplateDraftSchema.index({ createdBy: 1, createdAt: -1 });

// ─── toJSON Transform ───────────────────────────────────────────────────────────

TemplateDraftSchema.set("toJSON", {
	transform: (_doc, ret: { __v?: number }) => {
		delete ret.__v;
		return ret;
	},
});

// ─── Model Export ───────────────────────────────────────────────────────────────

export const TemplateDraft = model<ITemplateDraftDocument>("TemplateDraft", TemplateDraftSchema);
