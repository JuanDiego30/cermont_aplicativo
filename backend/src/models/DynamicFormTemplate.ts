/**
 * DynamicFormTemplate Model — Mongoose schema
 *
 * Stores dynamic form templates for CERMONT operational forms:
 * - CCTV Maintenance
 * - Lifeline Vertical Inspection
 * - Work Planning
 *
 * Aligned with @cermont/shared-types DynamicFormTemplateSchema
 */

import type { DynamicFormTemplate as DynamicFormTemplateType } from "@cermont/shared-types";
import { model, Schema, Types } from "mongoose";

const formFieldSchema = new Schema(
	{
		key: { type: String, required: true, maxlength: 100 },
		label: { type: String, required: true, maxlength: 200 },
		type: {
			type: String,
			required: true,
			enum: [
				"text",
				"textarea",
				"number",
				"select",
				"multiselect",
				"date",
				"datetime",
				"checkbox",
				"file",
				"signature",
				"gps",
			],
		},
		required: { type: Boolean, default: false },
		placeholder: { type: String, maxlength: 200 },
		defaultValue: { type: Schema.Types.Mixed },
		options: [
			{
				value: { type: String, required: true },
				label: { type: String, required: true },
				_id: false,
			},
		],
		allowCustomOption: { type: Boolean, default: false },
		validation: {
			minLength: Number,
			maxLength: Number,
			min: Number,
			max: Number,
			pattern: String,
		},
	},
	{ _id: false },
);

const dynamicFormTemplateSchema = new Schema(
	{
		name: { type: String, required: true, maxlength: 200, index: true },
		description: { type: String, maxlength: 500 },
		fields: {
			type: [formFieldSchema],
			required: true,
			validate: [Array.isArray as (...args: never[]) => boolean, "At least one field required"],
		},
		status: {
			type: String,
			enum: ["active", "draft", "archived"],
			default: "draft",
			index: true,
		},
		version: { type: Number, default: 1 },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		collection: "dynamic_form_templates",
	},
);

dynamicFormTemplateSchema.index({ status: 1, updatedAt: -1 });

export type DynamicFormTemplateDocument = DynamicFormTemplateType & {
	_id: Types.ObjectId;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
};

export const DynamicFormTemplate = model<DynamicFormTemplateDocument>(
	"DynamicFormTemplate",
	dynamicFormTemplateSchema,
);
